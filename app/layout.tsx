import type { Metadata } from "next";
import { Instrument_Serif, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-heading",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NebenkosenCheck – Nebenkostenabrechnung prüfen lassen",
  description:
    "KI-gestützte Prüfung Ihrer Nebenkostenabrechnung auf Fehler, unzulässige Kosten und Fristversäumnisse. Basierend auf deutschem Mietrecht.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${instrumentSerif.variable} ${ibmPlexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
