import Link from "next/link";
import { Nav } from "@/components/nav";

export default function DatenschutzPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-heading text-primary font-normal mb-8">
          Datenschutzerklärung
        </h1>
        <div className="space-y-6 text-sm text-muted-foreground">
          <section>
            <h2 className="text-lg font-heading text-primary font-normal mb-2">
              1. Verantwortlicher
            </h2>
            <p>
              Verantwortlicher im Sinne der DSGVO ist der Betreiber von
              NebenkosenCheck (Kontakt: kontakt@nebenkosencheck.de).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading text-primary font-normal mb-2">
              2. Erhobene Daten
            </h2>
            <p>
              Wir erheben folgende Daten: E-Mail-Adresse (für das Nutzerkonto),
              hochgeladene PDF-Dokumente (zur Analyse), Zahlungsdaten (werden
              nur von Stripe verarbeitet).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading text-primary font-normal mb-2">
              3. Zweck der Datenverarbeitung
            </h2>
            <p>
              Ihre Daten werden ausschließlich zur Bereitstellung des Dienstes
              (Analyse von Nebenkostenabrechnungen) verwendet. PDFs werden zur
              Analyse an die Anthropic API übermittelt und nicht dauerhaft
              gespeichert. Es erfolgt keine Weitergabe an Dritte, außer an
              Supabase (Datenspeicherung) und Anthropic (KI-Analyse).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading text-primary font-normal mb-2">
              4. Rechtsgrundlage
            </h2>
            <p>
              Die Verarbeitung erfolgt auf Basis von Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. a DSGVO
              (Einwilligung).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading text-primary font-normal mb-2">
              5. Ihre Rechte
            </h2>
            <p>
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung,
              Einschränkung der Verarbeitung und Datenübertragbarkeit. Wenden
              Sie sich dazu an kontakt@nebenkosencheck.de.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading text-primary font-normal mb-2">
              6. Speicherdauer
            </h2>
            <p>
              Ihre Daten werden gespeichert, solange Ihr Konto aktiv ist. Nach
              Kontoauflösung werden alle personenbezogenen Daten innerhalb von
              30 Tagen gelöscht.
            </p>
          </section>

          <p>
            <Link href="/" className="text-primary hover:underline">
              Zurück zur Startseite
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
