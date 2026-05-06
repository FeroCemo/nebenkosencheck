import { createClient } from "@/lib/supabase/server";
import { ClaudeResponseSchema } from "@/lib/schemas";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;

const SYSTEM_PROMPT = `Du bist ein Experte für deutsches Mietrecht, spezialisiert auf Nebenkostenabrechnungen.

Rechtliche Grundlagen:
- BetrKV § 1-2: Abschließende Liste umlagefähiger Betriebskosten
- BGB § 556 Abs. 3: Abrechnungsfrist 12 Monate nach Abrechnungszeitraum-Ende
- BGB § 556 Abs. 3 S. 5: Widerspruchsfrist Mieter 12 Monate nach Erhalt
- HeizkV § 7-8: Mindestens 50% der Heiz-/Warmwasserkosten nach Verbrauch

NICHT umlagefähig (immer severity: critical):
- Verwaltungskosten (Hausverwaltung, Buchführung, Porto, Bankgebühren)
- Instandhaltung und Reparaturen
- Leerstandskosten
- Anwalts- und Prozesskosten
- Kapitalkosten / Zinsen
- Kosten der Abrechnungserstellung

Antworte AUSSCHLIESSLICH mit validem JSON. Kein Text, kein Markdown.`;

async function callClaude(extractedText: string, zustelldatum: string) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const userPrompt = `Analysiere diese Nebenkostenabrechnung.
Zustelldatum laut Mieter: ${zustelldatum}
Heute: ${new Date().toISOString().split("T")[0]}

TEXT:
${extractedText.slice(0, 12000)}

Antworte mit diesem JSON:
{
  "landlord_name": string | null,
  "tenant_name": string | null,
  "address": string | null,
  "abrechnungsjahr": number | null,
  "abrechnungszeitraum_start": "YYYY-MM-DD" | null,
  "abrechnungszeitraum_end": "YYYY-MM-DD" | null,
  "widerspruchsfrist_end": "YYYY-MM-DD" | null,
  "abrechnungsfrist_violated": boolean,
  "total_nachzahlung": number | null,
  "total_guthaben": number | null,
  "risk_score": 0-100,
  "summary": "2-3 Sätze Gesamtbewertung auf Deutsch",
  "findings": [{
    "id": "uuid",
    "category": "NICHT_UMLAGEFAEHIG|RECHENFAHLER|FRISTVERSTOSS|VERTEILER_FEHLER|FEHLENDE_BELEGE|FORMFEHLER|VERDACHT",
    "severity": "critical|warning|info",
    "title": "Kurztitel Deutsch",
    "description": "Ausführliche Erklärung Deutsch",
    "legal_basis": "z.B. § 1 Abs. 2 Nr. 1 BetrKV",
    "position_in_document": string | null,
    "claimed_amount": number | null,
    "potential_saving": number | null,
    "widerspruch_text": "Fertiger Satz für Widerspruchsbrief" | null
  }]
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { analysisId, zustelldatum } = await request.json();

  if (!analysisId || !zustelldatum) {
    return Response.json({ error: "analysisId and zustelldatum required" }, { status: 400 });
  }

  const { data: analysis } = await supabase
    .from("analyses")
    .select("pdf_storage_path, user_id")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (!analysis) {
    return Response.json({ error: "Analysis not found" }, { status: 404 });
  }

  await supabase.from("analyses").update({ status: "processing" }).eq("id", analysisId);

  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("nebenkostenanalysen")
      .download(analysis.pdf_storage_path);

    if (downloadError || !fileData) {
      throw new Error("Could not download PDF");
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const parsed = await pdf(buffer);

    if (!parsed.text || parsed.text.trim().length < 50) {
      await supabase
        .from("analyses")
        .update({ status: "error" })
        .eq("id", analysisId);
      return Response.json(
        { error: "Bitte OCR-Version hochladen" },
        { status: 422 }
      );
    }

    const extractedText = parsed.text;

    await supabase
      .from("analyses")
      .update({ extracted_text: extractedText })
      .eq("id", analysisId);

    let claudeRawResponse: string;
    try {
      claudeRawResponse = await callClaude(extractedText, zustelldatum);
    } catch {
      claudeRawResponse = await callClaude(extractedText, zustelldatum);
    }

    const claudeJson = JSON.parse(claudeRawResponse);
    const validated = ClaudeResponseSchema.parse(claudeJson);

    await supabase
      .from("analyses")
      .update({
        status: "done",
        zustelldatum,
        abrechnungsjahr: validated.abrechnungsjahr,
        abrechnungszeitraum_start: validated.abrechnungszeitraum_start,
        abrechnungszeitraum_end: validated.abrechnungszeitraum_end,
        widerspruchsfrist_end: validated.widerspruchsfrist_end,
        abrechnungsfrist_violated: validated.abrechnungsfrist_violated,
        landlord_name: validated.landlord_name,
        tenant_name: validated.tenant_name,
        address: validated.address,
        total_nachzahlung: validated.total_nachzahlung,
        total_guthaben: validated.total_guthaben,
        findings: validated.findings,
        risk_score: validated.risk_score,
        summary: validated.summary,
      })
      .eq("id", analysisId);

    await supabase
      .from("profiles")
      .update({ free_analyses_used: supabase.rpc("increment", { x: 1 }) as unknown as number })
      .eq("id", user.id);

    return Response.json({ success: true, analysisId });
  } catch (err) {
    await supabase
      .from("analyses")
      .update({ status: "error" })
      .eq("id", analysisId);
    console.error("Analysis error:", err);
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
