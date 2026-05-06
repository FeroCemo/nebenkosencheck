import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Analysis } from "@/types";

function RiskBadge({ score }: { score: number | null }) {
  if (score == null) return <Badge variant="outline">—</Badge>;
  if (score <= 30) return <Badge className="bg-green-100 text-green-700 border-green-200">{score}</Badge>;
  if (score <= 60) return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">{score}</Badge>;
  return <Badge className="bg-danger/10 text-danger border-danger/20">{score}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "done") return <Badge className="bg-green-100 text-green-700 border-green-200">Fertig</Badge>;
  if (status === "error") return <Badge className="bg-danger/10 text-danger border-danger/20">Fehler</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, created_at, address, abrechnungsjahr, risk_score, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col min-h-screen">
      <Nav user={user} />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading text-primary font-normal">
            Meine Analysen
          </h1>
          <Link href="/analyse/neu" className={cn(buttonVariants(), "bg-primary text-primary-foreground")}>
            Neue Prüfung
          </Link>
        </div>

        {!analyses || analyses.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="mb-4">Noch keine Analysen vorhanden.</p>
            <Link href="/analyse/neu" className={cn(buttonVariants(), "bg-primary text-primary-foreground")}>
              Erste Prüfung starten
            </Link>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-primary">Datum</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Adresse</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Jahr</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Risiko</th>
                  <th className="text-left px-4 py-3 font-medium text-primary">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {(analyses as Partial<Analysis>[]).map((a, i) => (
                  <tr
                    key={a.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleDateString("de-DE")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-[200px] truncate">
                      {a.address || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.abrechnungsjahr || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge score={a.risk_score ?? null} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status || ""} />
                    </td>
                    <td className="px-4 py-3">
                      {a.status === "done" && (
                        <Link
                          href={`/analyse/${a.id}`}
                          className="text-primary hover:underline text-xs"
                        >
                          Ansehen
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
