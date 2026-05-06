import Link from "next/link";
import { Nav } from "@/components/nav";

export default function ImpressumPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-heading text-primary font-normal mb-8">
          Impressum
        </h1>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p className="font-medium text-foreground">Angaben gemäß § 5 TMG</p>
          <p>
            [Ihr Name]<br />
            [Straße Hausnummer]<br />
            [PLZ Ort]<br />
            Deutschland
          </p>
          <p>
            <strong>Kontakt</strong><br />
            E-Mail: kontakt@nebenkosencheck.de
          </p>
          <p>
            <strong>Hinweis</strong><br />
            NebenkosenCheck ersetzt keine Rechtsberatung. Die bereitgestellten
            Informationen und Analysen dienen ausschließlich der allgemeinen
            Information und stellen keine rechtliche Beratung dar.
          </p>
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
