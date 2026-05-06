"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  analysisId: string;
  isPro: boolean;
  existingBrief: string | null;
  tenant: string | null;
  landlord: string | null;
}

export function WiderspruchSection({
  analysisId,
  isPro,
  existingBrief,
  tenant,
  landlord,
}: Props) {
  const [brief, setBrief] = useState(existingBrief);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateBrief() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/generate-brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json();
      setError(data.error || "Fehler beim Erstellen des Briefes");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading font-normal text-primary">
          Widerspruchsbrief
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isPro && !brief && (
          <div className="relative">
            <div className="blur-sm select-none pointer-events-none text-sm text-muted-foreground leading-relaxed h-32 overflow-hidden">
              {tenant || "Mieter"}{"\n"}
              Musterstraße 1{"\n"}
              12345 Musterstadt{"\n\n"}
              An{"\n"}
              {landlord || "Vermieter"}{"\n\n"}
              Betreff: Widerspruch Nebenkostenabrechnung...
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/80 to-transparent">
              <div className="text-center space-y-3">
                <p className="text-sm font-medium text-primary">
                  Widerspruchsbrief mit Pro freischalten
                </p>
                <Link
                  href="/settings"
                  className={cn(buttonVariants({ variant: "default" }), "bg-primary text-primary-foreground")}
                >
                  Pro ab €4,99/Monat
                </Link>
              </div>
            </div>
          </div>
        )}

        {isPro && !brief && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Klicken Sie auf "Brief erstellen", um einen formellen Widerspruchsbrief
              zu generieren.
            </p>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button
              onClick={generateBrief}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Brief wird erstellt…" : "Brief erstellen"}
            </Button>
          </div>
        )}

        {brief && (
          <div className="space-y-3">
            <pre className="whitespace-pre-wrap text-sm font-sans text-foreground bg-muted/30 rounded p-4 border border-border leading-relaxed">
              {brief}
            </pre>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(brief);
              }}
            >
              Brief kopieren
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
