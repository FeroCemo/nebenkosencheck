"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type UploadStep = "idle" | "uploading" | "analysing" | "done" | "error";

const STEP_LABELS = {
  idle: "",
  uploading: "PDF wird hochgeladen…",
  analysing: "Abrechnung wird analysiert…",
  done: "Fertig!",
  error: "Fehler",
};

export default function NeueAnalisePage() {
  const [file, setFile] = useState<File | null>(null);
  const [zustelldatum, setZustelldatum] = useState("");
  const [step, setStep] = useState<UploadStep>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFile(f: File) {
    if (f.type !== "application/pdf") {
      setError("Nur PDF-Dateien sind erlaubt.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Die Datei darf maximal 10 MB groß sein.");
      return;
    }
    setError("");
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !zustelldatum) return;

    setError("");
    setStep("uploading");
    setProgress(20);

    try {
      // Step 1: Get signed upload URL
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name }),
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        if (data.error === "LIMIT_REACHED") {
          setError(
            "Sie haben Ihr kostenloses Analyse-Limit erreicht. Bitte upgraden Sie auf Pro."
          );
        } else {
          setError(data.error || "Upload fehlgeschlagen");
        }
        setStep("error");
        return;
      }

      const { signedUrl, analysisId } = await uploadRes.json();
      setProgress(40);

      // Step 2: Upload PDF directly to Supabase Storage
      const putRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/pdf" },
      });

      if (!putRes.ok) {
        setError("Fehler beim Hochladen der Datei.");
        setStep("error");
        return;
      }

      setProgress(60);
      setStep("analysing");

      // Step 3: Start analysis
      const analyseRes = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, zustelldatum }),
      });

      if (!analyseRes.ok) {
        const data = await analyseRes.json();
        if (data.error === "Bitte OCR-Version hochladen") {
          setError(
            "Das PDF enthält keinen lesbaren Text. Bitte laden Sie eine OCR-Version hoch."
          );
        } else {
          setError(data.error || "Analyse fehlgeschlagen");
        }
        setStep("error");
        return;
      }

      setProgress(80);

      // Step 4: Poll for status
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        const statusRes = await fetch(`/api/analyse/${analysisId}/status`);
        const { status } = await statusRes.json();

        if (status === "done") {
          clearInterval(poll);
          setProgress(100);
          setStep("done");
          setTimeout(() => router.push(`/analyse/${analysisId}`), 800);
        } else if (status === "error") {
          clearInterval(poll);
          setError("Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.");
          setStep("error");
        } else if (attempts > 40) {
          clearInterval(poll);
          setError("Zeitüberschreitung. Bitte versuchen Sie es erneut.");
          setStep("error");
        }
      }, 3000);
    } catch {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
      setStep("error");
    }
  }

  const isLoading = step === "uploading" || step === "analysing";

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="font-heading font-normal text-2xl text-primary">
              Nebenkostenabrechnung prüfen
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Laden Sie Ihre Abrechnung als PDF hoch und geben Sie das
              Zustelldatum an.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : file
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {file ? (
                  <div>
                    <p className="font-medium text-primary">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted-foreground text-sm">
                      PDF hier ablegen oder klicken zum Auswählen
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximal 10 MB
                    </p>
                  </div>
                )}
              </div>

              {/* Zustelldatum */}
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="zustelldatum">
                  Zustelldatum der Abrechnung
                </label>
                <input
                  id="zustelldatum"
                  type="date"
                  value={zustelldatum}
                  onChange={(e) => setZustelldatum(e.target.value)}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground">
                  Das Datum, an dem Sie die Abrechnung erhalten haben
                </p>
              </div>

              {/* Progress */}
              {isLoading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    {STEP_LABELS[step]}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-md bg-danger/10 border border-danger/20 p-3">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!file || !zustelldatum || isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? STEP_LABELS[step] : "Abrechnung prüfen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
