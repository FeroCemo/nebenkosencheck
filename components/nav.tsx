"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavProps {
  user?: { email?: string } | null;
}

export function Nav({ user }: NavProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-white sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-heading text-xl text-primary font-normal">
          NebenkosenCheck
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/analyse/neu"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Neue Prüfung
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Meine Analysen
              </Link>
              <Link
                href="/settings"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Einstellungen
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Abmelden
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Anmelden
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "bg-primary text-primary-foreground")}>
                Kostenlos starten
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
