import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Analysis, Finding } from "@/types";
import { WiderspruchSection } from "./widerspruch-section";

function RiskGauge({ score }: { score: number }) {
  const color =
    score <= 30
      ? "text-green-600"
      : score <= 60
      ? "text-yellow-600"
      : "text-danger";
  const label =
    score <= 30 ? "Geringes Risiko" : score <= 60 ? "Mittleres Risiko" : "Hohes Risiko";

  const circumference = 2 * Math.PI * 40;
  const strokeDash = (score / 100) * circumference;
  const strokeColor =
    score <= 30 ? "#16a34a" : score <= 60 ? "#ca8a04" : "#C0392B";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <p className={`text-sm font-medium ${color}`}>{label}</p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Finding["severity"] }) {
  if (severity === "critical")
    return <Badge className="bg-danger/10 text-danger border-danger/20">Kritisch</Badge>;
  if (severity === "warning")
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Hinweis</Badge>;
  return <Badge variant="outline">Info</Badge>;
}

function FindingCard({ finding }: { finding: Finding }) {
  const borderColor =
    finding.severity === "critical"
      ? "border-l-danger"
      : finding.severity === "warning"
      ? "border-l-yellow-500"
      : "border-l-gray-300";

  return (
    <div className={`border-l-4 ${borderColor} bg-white rounded-r-lg p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm text-primary">{finding.title}</h4>
        <SeverityBadge severity={finding.severity} />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
      <p className="text-xs text-muted-foreground/70 font-mono">{finding.legal_basis}</p>
      {finding.potential_saving != null && finding.potential_saving > 0 && (
        <p className="text-sm font-medium text-green-700 mt-2">
          Mögliche Ersparnis: {finding.potential_saving.toFixed(2)} €
        </p>
      )}
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE");
}

export default async function AnalysePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!analysis) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const isPro =
    profile?.subscription_status === "pro" ||
    profile?.subscription_status === "one_time";

  const a = analysis as Analysis;
  const findings = (a.findings as Finding[]) || [];
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;

  return (
    <div className="flex flex-col min-h-screen">
      <Nav user={user} />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading text-primary font-normal">
            Ergebnis Ihrer Prüfung
          </h1>
          {a.address && (
            <p className="text-muted-foreground mt-1">{a.address}</p>
          )}
        </div>

        {/* Summary row */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="sm:col-span-1 flex justify-center sm:justify-start">
            {a.risk_score != null && <RiskGauge score={a.risk_score} />}
          </div>
          <div className="sm:col-span-2 space-y-3">
            {a.summary && (
              <p className="text-sm leading-relaxed text-foreground">{a.summary}</p>
            )}
            <div className="flex gap-4 text-sm">
              {criticalCount > 0 && (
                <span className="text-danger font-medium">{criticalCount} kritische Befunde</span>
              )}
              {warningCount > 0 && (
                <span className="text-yellow-700 font-medium">{warningCount} Hinweise</span>
              )}
            </div>
            {a.total_nachzahlung != null && (
              <p className="text-sm">
                Geforderte Nachzahlung:{" "}
                <span className="font-semibold text-danger">
                  {a.total_nachzahlung.toFixed(2)} €
                </span>
              </p>
            )}
            {a.total_guthaben != null && (
              <p className="text-sm">
                Guthaben:{" "}
                <span className="font-semibold text-green-700">
                  {a.total_guthaben.toFixed(2)} €
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Fristen */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading font-normal text-primary">
              Fristen & Zeitraum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Abrechnungszeitraum</p>
                <p className="font-medium">
                  {formatDate(a.abrechnungszeitraum_start)} –{" "}
                  {formatDate(a.abrechnungszeitraum_end)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Zustelldatum</p>
                <p className="font-medium">{formatDate(a.zustelldatum)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Widerspruchsfrist</p>
                <p className={`font-medium ${a.widerspruchsfrist_end ? "text-foreground" : "text-yellow-700"}`}>
                  {a.widerspruchsfrist_end ? formatDate(a.widerspruchsfrist_end) : "Nicht bestimmt (Zustelldatum fehlt)"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Abrechnungsfrist</p>
                <p className={`font-medium ${a.abrechnungsfrist_violated ? "text-danger" : "text-foreground"}`}>
                  {a.abrechnungsfrist_violated ? "Verletzt — Nachforderung unwirksam" : "Eingehalten"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Findings */}
        {findings.length > 0 && (
          <div>
            <h2 className="text-2xl font-heading text-primary font-normal mb-4">
              Befunde ({findings.length})
            </h2>
            <div className="space-y-3">
              {findings.map((f) => (
                <FindingCard key={f.id} finding={f} />
              ))}
            </div>
          </div>
        )}

        {/* Widerspruchsbrief */}
        <WiderspruchSection
          analysisId={id}
          isPro={isPro}
          existingBrief={a.widerspruchsbrief}
          tenant={a.tenant_name}
          landlord={a.landlord_name}
        />

        {/* Disclaimer */}
        <div className="rounded-md border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
          NebenkosenCheck ersetzt keine Rechtsberatung. Bei rechtlichen Fragen
          wenden Sie sich an einen Mieterverein oder Rechtsanwalt.
        </div>
      </main>
    </div>
  );
}
