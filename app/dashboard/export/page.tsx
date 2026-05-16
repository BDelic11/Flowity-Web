"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/ui/page-layout";
import { Download, Users, CalendarDays, History, Loader2 } from "lucide-react";
import { toast } from "sonner";

const WEEK_OPTIONS = [1, 2, 4, 8, 12, 24, 52] as const;

type WeekOption = typeof WEEK_OPTIONS[number];

// Downloads a CSV from an authenticated API endpoint
async function downloadCsv(path: string, filename: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

  const res = await fetch(`${baseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Individual export card ────────────────────────────────────────────────────

type ExportCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onExport: () => Promise<void>;
  children?: React.ReactNode;
};

function ExportCard({ icon, title, description, buttonLabel, onExport, children }: ExportCardProps) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await onExport();
      toast.success("CSV preuzet!");
    } catch {
      toast.error("Preuzimanje nije uspjelo. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary mt-0.5">{icon}</div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-1 text-sm">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1">{children}</div>
        <Button onClick={handle} disabled={loading} size="sm" className="shrink-0">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {loading ? "Preuzimanje..." : buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Week selector ─────────────────────────────────────────────────────────────

function WeekSelector({ value, onChange }: { value: WeekOption; onChange: (v: WeekOption) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Razdoblje:</span>
      <div className="flex gap-1 flex-wrap">
        {WEEK_OPTIONS.map((w) => (
          <button
            key={w}
            onClick={() => onChange(w)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              value === w
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {w === 52 ? "1 god." : `${w} ${w === 1 ? "tjedan" : "tjd."}`}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExportPage() {
  const [upcomingWeeks, setUpcomingWeeks] = useState<WeekOption>(4);
  const [historyWeeks, setHistoryWeeks]   = useState<WeekOption>(12);

  return (
    <PageLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Izvoz podataka</h2>
        <p className="text-muted-foreground">
          Preuzmite podatke kao CSV — otvorite u Excelu ili Googleovim tablicama.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {/* Clients */}
        <ExportCard
          icon={<Users className="h-4 w-4" />}
          title="Popis klijenata"
          description="Svi WhatsApp klijenti — ime, telefon, GDPR status i broj rezervacija."
          buttonLabel="Preuzmi CSV"
          onExport={() => downloadCsv("/export/clients.csv", "klijenti.csv")}
        />

        {/* Upcoming bookings */}
        <ExportCard
          icon={<CalendarDays className="h-4 w-4" />}
          title="Nadolazeće rezervacije"
          description="Potvrđene rezervacije u odabranom periodu unaprijed — idealno za ispis rasporeda."
          buttonLabel="Preuzmi CSV"
          onExport={() =>
            downloadCsv(`/export/upcoming.csv?weeks=${upcomingWeeks}`, `rezervacije-${upcomingWeeks}tjd.csv`)
          }
        >
          <WeekSelector value={upcomingWeeks} onChange={setUpcomingWeeks} />
        </ExportCard>

        {/* Booking history */}
        <ExportCard
          icon={<History className="h-4 w-4" />}
          title="Povijest rezervacija"
          description="Sve rezervacije iz odabranog perioda unazad — korisno za analizu i arhivu."
          buttonLabel="Preuzmi CSV"
          onExport={() =>
            downloadCsv(`/export/history.csv?weeks=${historyWeeks}`, `povijest-${historyWeeks}tjd.csv`)
          }
        >
          <WeekSelector value={historyWeeks} onChange={setHistoryWeeks} />
        </ExportCard>

      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        CSV datoteke su kodirane u UTF-8. Pri otvaranju u Excelu odaberite "Uvoz podataka" i postavite kodiranje na UTF-8 kako bi se dijakritici prikazali ispravno.
      </p>
    </PageLayout>
  );
}
