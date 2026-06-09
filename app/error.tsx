"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <html>
      <body className="min-h-screen grid place-items-center bg-background p-6">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-muted grid place-items-center">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Nešto je pošlo po krivu
          </h1>
          <p className="mt-2 text-muted-foreground">
            Došlo je do neočekivane greške. Možete pokušati ponovo ili se
            vratiti na sigurno.
          </p>

          {error?.digest && (
            <p className="mt-2 text-xs text-muted-foreground">
              ID greške: <code className="font-mono">{error.digest}</code>
            </p>
          )}

          {isDev && error?.message && (
            <pre className="mt-4 max-h-48 overflow-auto rounded-md border bg-card p-3 text-left text-sm">
              {error.message}
            </pre>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => reset()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Pokušaj ponovo
            </Button>

            <Button asChild variant="secondary" className="gap-2">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Na nadzornu ploču
              </Link>
            </Button>

            <Button asChild variant="outline" className="gap-2">
              <a
                href={`mailto:support@flowity-ai.com?subject=Flowity%20Greška&body=ID%20greške:%20${encodeURIComponent(
                  error?.digest ?? "n/a"
                )}%0D%0A%0D%0AOpis:%20`}
              >
                <Bug className="h-4 w-4" />
                Prijavi problem
              </a>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
