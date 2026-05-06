import { createClient } from "@/lib/supabase/server";
import { Finding } from "@/types";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    (profile.subscription_status !== "pro" &&
      profile.subscription_status !== "one_time")
  ) {
    return Response.json({ error: "PRO_REQUIRED" }, { status: 403 });
  }

  const { analysisId } = await request.json();

  const { data: analysis } = await supabase
    .from("analyses")
    .select(
      "tenant_name, landlord_name, address, abrechnungsjahr, widerspruchsfrist_end, findings"
    )
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (!analysis) {
    return Response.json({ error: "Analysis not found" }, { status: 404 });
  }

  const findings = (analysis.findings as Finding[]) || [];
  const criticalFindings = findings.filter((f) => f.severity === "critical");
  const today = new Date().toISOString().split("T")[0];

  const prompt = `Erstelle einen formellen Widerspruchsbrief auf Deutsch.

Mieter: ${analysis.tenant_name || "Mieter"}
Vermieter: ${analysis.landlord_name || "Vermieter"}
Adresse: ${analysis.address || "Mietobjekt"}
Abrechnungsjahr: ${analysis.abrechnungsjahr || ""}
Datum: ${today}
Widerspruchsfrist bis: ${analysis.widerspruchsfrist_end || "unbekannt"}

Beanstandungen:
${criticalFindings.map((f) => `- ${f.title}: ${f.widerspruch_text || f.description}`).join("\n")}

Brief-Anforderungen:
- Formeller Briefkopf
- Betreff: "Widerspruch Nebenkostenabrechnung ${analysis.abrechnungsjahr || ""}"
- Jeden Punkt mit Rechtsgrundlage
- Forderung: Korrektur + Rückerstattung
- Fristsetzung 2 Wochen
- Sachlich, keine Emotionen
- Unterschriftsblock`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return Response.json({ error: "Unexpected response" }, { status: 500 });
  }

  await supabase
    .from("analyses")
    .update({ widerspruchsbrief: content.text })
    .eq("id", analysisId);

  return Response.json({ success: true });
}
