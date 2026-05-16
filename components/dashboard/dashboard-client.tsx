"use client";

import { Calendar, Users, TrendingUp, Euro, Scissors, UserCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCountdown from "@/hooks/useCountdown";
import type { NextAppointment, SalonMetrics } from "@/types/dashboard";
import formatCurrencyEUR from "@/lib/currency-helper";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/locale-context";

function MetricSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-4 w-32 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-9 w-20 rounded bg-muted mb-1" />
        <div className="h-3 w-24 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

type Props = {
  metrics: SalonMetrics | null;
  isLoading: boolean;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayLabel(iso: string, today: Date) {
  const d = new Date(iso);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(d, today)) return null;
  if (isSameDay(d, tomorrow)) return "tomorrow";
  return d.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "2-digit" });
}

export default function DashboardClient({ metrics, isLoading }: Props) {
  const { t } = useLocale();

  // Backend defaults this list to empty when the org has no bookings; defensive ?? keeps the
  // optimistic-update / stale-cache path safe if a partial response ever lands.
  const upcoming: NextAppointment[] = metrics?.upcomingAppointments ?? [];
  const next = metrics?.nextAppointment ?? upcoming[0] ?? null;
  const { msLeft, label } = useCountdown(next?.startAt);

  const urgency =
    msLeft == null
      ? "none"
      : msLeft <= 0
      ? "live"
      : msLeft <= 5 * 60 * 1000
      ? "critical"
      : msLeft <= 15 * 60 * 1000
      ? "warning"
      : "ok";

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MetricSkeleton />
        </div>
        <div className="grid gap-4">
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </div>
      </div>
    );
  }

  const now = Date.now();
  const today = new Date();
  const totalUpcoming = upcoming.length;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* LEFT: today's schedule timeline */}
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {t("dashboard.upcomingSchedule")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.nextCount", { count: String(totalUpcoming) })}
              </p>
            </div>
          </div>
          {next && label && (
            <span
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full",
                urgency === "live" && "bg-emerald-100 text-emerald-700",
                urgency === "critical" && "bg-rose-100 text-rose-700",
                urgency === "warning" && "bg-amber-100 text-amber-700",
                (urgency === "ok" || urgency === "none") && "bg-muted text-muted-foreground"
              )}
            >
              {urgency === "live"
                ? t("dashboard.inProgress")
                : t("dashboard.inCountdown", { label })}
            </span>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary/60">
                <Scissors className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold">
                {t("dashboard.emptyUpcomingTitle")}
              </h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                {t("dashboard.emptyUpcomingDesc")}
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {upcoming.map((appt, idx) => {
                const isNext = next != null && appt.startAt === next.startAt && appt.clientName === next.clientName;
                const startMs = new Date(appt.startAt).getTime();
                const live = startMs <= now && new Date(appt.endAt).getTime() > now;

                const dayLabel = formatDayLabel(appt.startAt, today);
                const dayLabelText =
                  dayLabel === "tomorrow" ? t("dashboard.tomorrow") : dayLabel;

                return (
                  <li
                    key={`${appt.startAt}-${appt.clientName}-${idx}`}
                    className={cn(
                      "relative grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 transition-colors",
                      isNext && "bg-primary/8 ring-1 ring-primary/20"
                    )}
                  >
                    {/* Accent rail for the next-up booking so it's recognisable at a glance */}
                    {isNext && (
                      <span className="absolute inset-y-2 left-0 w-1.5 rounded-r-full bg-primary" aria-hidden="true" />
                    )}

                    <div className="flex flex-col items-start text-xs font-medium tabular-nums tracking-tight">
                      <span
                        className={cn(
                          "font-semibold",
                          isNext ? "text-base text-primary" : "text-sm text-foreground"
                        )}
                      >
                        {formatTime(appt.startAt)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatTime(appt.endAt)}
                      </span>
                      {dayLabelText && (
                        <span
                          className={cn(
                            "mt-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            isNext
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {dayLabelText}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "truncate font-semibold",
                            isNext ? "text-foreground" : "text-foreground/90"
                          )}
                        >
                          {appt.clientName}
                        </span>
                        {isNext && !live && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                            {t("dashboard.upNext")}
                          </span>
                        )}
                        {live && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                            {t("dashboard.inProgress")}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Scissors className="h-3 w-3 shrink-0" />
                        <span className="truncate">{appt.serviceName}</span>
                      </div>
                    </div>

                    <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                      <UserCircle2 className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {appt.staffName ?? t("dashboard.noStaff")}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* RIGHT: stacked KPI column */}
      <div className="grid gap-4 auto-rows-min">
        <Card className="border-0 shadow-sm bg-linear-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.todaysAppointments")}
            </CardTitle>
            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
              {metrics?.todaysAppointmentsCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.bookedToday")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-linear-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.todaysRevenue")}
            </CardTitle>
            <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <Euro className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
              {formatCurrencyEUR(metrics?.todaysRevenue ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.fromConfirmedBookings")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.activeStaff")}
            </CardTitle>
            <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              {metrics?.activeStaffCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.teamMembers")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-linear-to-br from-sky-50 to-white dark:from-sky-950/40 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.thisWeek")}
            </CardTitle>
            <div className="h-9 w-9 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sky-700 dark:text-sky-300">
              {metrics?.weeksAppointmentsCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard.appointmentsBooked")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
