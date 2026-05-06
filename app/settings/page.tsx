"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

type SubStatus = "free" | "pro" | "one_time";

const STATUS_LABELS: Record<SubStatus, string> = {
  free: "Kostenlos",
  pro: "Pro",
  one_time: "Einmalig",
};

export default function SettingsPage() {
  const [status, setStatus] = useState<SubStatus>("free");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();
      if (data) setStatus(data.subscription_status as SubStatus);
    }
    load();
  }, []);

  async function startCheckout(priceType: "pro" | "one_time") {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceType }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Nav user={user} />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full space-y-6">
        <h1 className="text-3xl font-heading text-primary font-normal">
          Einstellungen
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading font-normal text-primary">
              Abonnement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Aktueller Plan:</span>
              <Badge
                className={
                  status === "pro"
                    ? "bg-primary text-white"
                    : status === "one_time"
                    ? "bg-accent/20 text-accent border-accent/30"
                    : "bg-muted text-muted-foreground"
                }
              >
                {STATUS_LABELS[status]}
              </Badge>
            </div>

            {status === "free" && (
              <div className="space-y-3 pt-2">
                <p className="text-sm text-muted-foreground">
                  Upgraden Sie für unbegrenzte Analysen und Widerspruchsbriefe.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => startCheckout("pro")}
                    disabled={loading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Pro — €4,99/Monat
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => startCheckout("one_time")}
                    disabled={loading}
                  >
                    Einmalig — €9,99
                  </Button>
                </div>
              </div>
            )}

            {status === "pro" && (
              <p className="text-sm text-muted-foreground">
                Sie haben Pro. Unbegrenzte Analysen und Widerspruchsbriefe sind
                enthalten.
              </p>
            )}

            {status === "one_time" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sie haben ein einmaliges Paket. Für weitere Analysen upgraden
                  Sie auf Pro.
                </p>
                <Button
                  onClick={() => startCheckout("pro")}
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Auf Pro upgraden — €4,99/Monat
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading font-normal text-primary">
              Konto
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>{user?.email}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
