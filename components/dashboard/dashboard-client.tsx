"use client";

import { Calendar, Users, TrendingUp, Clock, Euro } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCountdown from "@/hooks/useCountdown";
import type { SalonMetrics } from "@/types/dashboard";
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

export default function DashboardClient({ metrics, isLoading }: Props) {
  const { t } = useLocale();
  const next = metrics?.nextAppointment ?? null;
  const { msLeft, label } = useCountdown(next?.startAt);

  const urgency =
    msLeft == null
      ? "none"
      : msLeft <= 5 * 60 * 1000
      ? "critical"
      : msLeft <= 15 * 60 * 1000
      ? "warning"
      : "ok";

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
        <div className="sm:col-span-2">
          <MetricSkeleton />
        </div>
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
      {/* Next Appointment - wide hero card */}
      <Card className="sm:col-span-2 border-0 shadow-md bg-linear-to-br from-violet-600 to-indigo-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-violet-100 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t("dashboard.nextAppointment")}
          </CardTitle>
          {next && (
            <span
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full",
                urgency === "critical" && "bg-red-500/30 text-red-100",
                urgency === "warning" && "bg-amber-400/30 text-amber-100",
                (urgency === "ok" || urgency === "none") &&
                  "bg-white/20 text-white"
              )}
            >
              {label ? t("dashboard.inCountdown", { label }) : "—"}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {next ? (
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold">{next.clientName}</div>
              <div className="text-sm text-violet-200 flex flex-wrap items-center gap-1.5">
                <span>{next.serviceName}</span>
                <span className="opacity-50">•</span>
                <span>
                  {new Date(next.startAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" – "}
                  {new Date(next.endAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {next.staffName && (
                  <>
                    <span className="opacity-50">•</span>
                    <span>with {next.staffName}</span>
                  </>
                )}
              </div>
              <div
                className={cn(
                  "mt-2 text-xs font-semibold uppercase tracking-wide",
                  urgency === "critical" && "text-red-300",
                  urgency === "warning" && "text-amber-300",
                  urgency === "ok" && "text-violet-200"
                )}
              >
                {msLeft != null && msLeft <= 0
                  ? t("dashboard.startingNow")
                  : urgency === "critical"
                  ? t("dashboard.verySoon")
                  : urgency === "warning"
                  ? t("dashboard.comingUp")
                  : t("dashboard.scheduled")}
              </div>
            </div>
          ) : (
            <div className="text-violet-200 text-sm">
              {t("dashboard.noAppointmentsToday")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card className="border-0 shadow-md bg-linear-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-background">
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

      {/* Active Staff */}
      <Card className="border-0 shadow-md bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-background">
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

      {/* Today's Revenue */}
      <Card className="border-0 shadow-md bg-linear-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-background">
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

      {/* This Week */}
      <Card className="border-0 shadow-md bg-linear-to-br from-sky-50 to-white dark:from-sky-950/40 dark:to-background">
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
  );
}
