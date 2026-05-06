"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/analyse/neu` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/analyse/neu");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Link href="/" className="font-heading text-xl text-primary mb-2 block">
            NebenkosenCheck
          </Link>
          <CardTitle className="font-heading font-normal text-primary">
            Konto erstellen
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Erste Analyse kostenlos — kein Kreditkarte.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="email">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="ihre@email.de"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="password">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Mind. 8 Zeichen"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Konto wird erstellt…" : "Kostenlos registrieren"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Mit der Registrierung stimmen Sie unserer{" "}
            <Link href="/datenschutz" className="underline">
              Datenschutzerklärung
            </Link>{" "}
            zu.
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Bereits registriert?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Anmelden
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
