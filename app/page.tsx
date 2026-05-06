import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Nav } from "@/components/nav";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Nav user={user} />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center max-w-3xl mx-auto w-full">
        <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 font-normal">
          Basierend auf deutschem Mietrecht · DSGVO-konform
        </Badge>
        <h1 className="text-5xl md:text-6xl font-heading font-normal text-primary leading-tight mb-6">
          Ihre Nebenkostenabrechnung in 60 Sekunden prüfen
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl">
          KI-gestützte Analyse auf Rechenfehler, unzulässige Kostenpositionen
          und Fristversäumnisse — inklusive Widerspruchsbrief.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={user ? "/analyse/neu" : "/register"}
            className={cn(buttonVariants({ size: "lg" }), "bg-primary text-primary-foreground text-base px-8")}
          >
            Jetzt kostenlos prüfen
          </Link>
          <Link
            href="#preise"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-base px-8")}
          >
            Preise ansehen
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-heading text-center text-primary mb-12">
            So funktioniert es
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "PDF hochladen",
                desc: "Laden Sie Ihre Nebenkostenabrechnung als PDF hoch. Sicher und verschlüsselt.",
              },
              {
                step: "02",
                title: "KI prüft",
                desc: "Unsere KI analysiert die Abrechnung auf Basis des deutschen Mietrechts in Sekunden.",
              },
              {
                step: "03",
                title: "Ergebnis + Brief",
                desc: "Sie erhalten eine detaillierte Auswertung und auf Wunsch einen fertigen Widerspruchsbrief.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <span className="text-4xl font-heading text-accent">{item.step}</span>
                <h3 className="text-xl font-heading text-primary">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preise" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-heading text-center text-primary mb-12">
            Transparente Preise
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="font-heading font-normal text-primary">Kostenlos</CardTitle>
                <p className="text-3xl font-semibold">€0</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>1 Analyse kostenlos</p>
                <p>Risiko-Score &amp; Befunde</p>
                <p className="line-through">Widerspruchsbrief</p>
                <Link href="/register" className={cn(buttonVariants(), "w-full mt-4 bg-primary text-primary-foreground")}>
                  Starten
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-white">Empfohlen</Badge>
              </div>
              <CardHeader>
                <CardTitle className="font-heading font-normal text-primary">Pro</CardTitle>
                <p className="text-3xl font-semibold">
                  €4,99<span className="text-base font-normal text-muted-foreground">/Monat</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Unbegrenzte Analysen</p>
                <p>Widerspruchsbrief inbegriffen</p>
                <p>Jederzeit kündbar</p>
                <Link href={user ? "/settings" : "/register?plan=pro"} className={cn(buttonVariants(), "w-full mt-4 bg-primary text-primary-foreground")}>
                  Pro wählen
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="font-heading font-normal text-primary">Einmalig</CardTitle>
                <p className="text-3xl font-semibold">€9,99</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>1 Analyse mit Brief</p>
                <p>Kein Abo</p>
                <p>Sofort verfügbar</p>
                <Link href={user ? "/settings" : "/register?plan=one_time"} className={cn(buttonVariants({ variant: "outline" }), "w-full mt-4")}>
                  Einmalig kaufen
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-heading text-center text-primary mb-12">
            Häufige Fragen
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Wie sicher sind meine Daten?",
                a: "Ihre PDFs werden verschlüsselt gespeichert und nicht an Dritte weitergegeben. Alle Daten werden auf EU-Servern verarbeitet (DSGVO-konform).",
              },
              {
                q: "Ersetzt das eine Rechtsberatung?",
                a: "Nein. NebenkosenCheck gibt Ihnen einen ersten Überblick und erstellt einen Widerspruchsentwurf. Bei rechtlichen Fragen wenden Sie sich an einen Mieterverein oder Rechtsanwalt.",
              },
              {
                q: "Was passiert wenn mein PDF nicht lesbar ist?",
                a: "Bitte laden Sie eine OCR-Version hoch (z.B. mit Adobe Acrobat oder einer kostenlosen Online-OCR-App).",
              },
              {
                q: "Kann ich den Widerspruchsbrief direkt verwenden?",
                a: "Der Brief ist ein professioneller Entwurf auf Basis Ihrer Abrechnung. Wir empfehlen, ihn vor dem Versand zu prüfen.",
              },
              {
                q: "Welche Rechtsbasis wird verwendet?",
                a: "BetrKV, BGB § 556, HeizkV — die relevanten Gesetze für Nebenkostenabrechnungen in Deutschland.",
              },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="font-semibold text-primary mb-2">{item.q}</h3>
                <p className="text-muted-foreground text-sm">{item.a}</p>
                {i < 4 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-heading text-primary">NebenkosenCheck</span>
          <div className="flex gap-6">
            <Link href="/impressum" className="hover:text-foreground transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-foreground transition-colors">
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
