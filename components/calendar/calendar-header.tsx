"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";
import { AppointmentDialog } from "@/components/appointments/appointment-dialog";
import type { StaffOption, ServiceOption } from "@/types/calendar";
import { useLocale } from "@/contexts/locale-context";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isPending?: boolean;
  staffOptions: StaffOption[];
  serviceOptions: ServiceOption[];
  onCreateBooking: (payload: {
    clientName: string;
    staffId: string;
    serviceId: string;
    startISO: string;
    endISO: string;
    notes?: string | null;
  }) => Promise<void>;
}

export function CalendarHeader({
  currentDate,
  onDateChange,
  isPending = false,
  staffOptions,
  serviceOptions,
  onCreateBooking,
}: CalendarHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useLocale();

  function shiftDate(days: number) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    onDateChange(d);
  }

  return (
    <>
      <div className="flex flex-col gap-3 border-b bg-background px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6 md:py-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shiftDate(-1)}
            disabled={isPending}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-0 flex-1 truncate text-center text-sm font-medium sm:min-w-[220px] sm:flex-none md:text-base">
            {format(currentDate, "EEEE, dd MMM yyyy")}
            {isPending && (
              <span className="ml-2 text-xs text-muted-foreground">{t("calendar.loading")}</span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => shiftDate(1)}
            disabled={isPending}
            className="shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
            disabled={isPending}
            className="shrink-0"
          >
            {t("calendar.today")}
          </Button>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="w-full gap-2 md:w-auto"
          disabled={isPending || staffOptions.length === 0}
        >
          <Plus className="h-4 w-4" />
          {t("calendar.newAppointment")}
        </Button>
      </div>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        staffOptions={staffOptions}
        services={serviceOptions}
        initialDateISO={currentDate.toISOString()}
        onSubmit={onCreateBooking}
      />
    </>
  );
}
