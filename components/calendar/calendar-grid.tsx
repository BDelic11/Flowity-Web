"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppointmentDetailsDialog } from "@/components/appointments/appointment-details-dialog";
import type { CalendarStaff, CalendarBooking } from "@/types/calendar";
import type { Appointment } from "@/lib/types";
import AppointmentCard from "@/components/appointments/appointment-card";
import { useLocale } from "@/contexts/locale-context";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const GRID_START_H = 9;
const GRID_END_H = 19;
const PX_PER_HOUR = 80;

const timeSlots = Array.from(
  { length: GRID_END_H - GRID_START_H },
  (_, i) => `${String(GRID_START_H + i).padStart(2, "0")}:00`
);

function posFromISO(iso: string) {
  const d = new Date(iso);
  const minutesFromStart = d.getHours() * 60 + d.getMinutes() - GRID_START_H * 60;
  return Math.max(0, (minutesFromStart / 60) * PX_PER_HOUR);
}

// Convert our CalendarBooking to the Appointment shape used by detail/card components
function toAppointment(b: CalendarBooking): Appointment {
  return {
    id: b.id,
    staffId: b.workerId ?? "",
    clientName: b.clientName,
    serviceName: b.serviceName,
    serviceId: b.serviceId,
    startTime: b.startTime,
    endTime: b.endTime,
    start: b.startAt,
    end: b.endAt,
    color: b.color,
    status: undefined,
    notes: b.notes,
  };
}

type Props = {
  staff: CalendarStaff[];
  bookings: CalendarBooking[];
  currentDate: Date;
  onDeleteBooking: (id: string) => Promise<void>;
  onUpdateBooking: (data: {
    bookingId: string;
    clientName: string;
    startAt: string;
    endAt: string;
    workerId?: string | null;
    notes?: string | null;
  }) => Promise<void>;
};

export function CalendarGrid({ staff, bookings, currentDate, onDeleteBooking, onUpdateBooking }: Props) {
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { t } = useLocale();

  const isToday = useMemo(() => {
    const now = new Date();
    return (
      now.getFullYear() === currentDate.getFullYear() &&
      now.getMonth() === currentDate.getMonth() &&
      now.getDate() === currentDate.getDate()
    );
  }, [currentDate]);

  const nowLineTop = useMemo(() => {
    if (!isToday) return null;
    const now = new Date();
    const minutesFromStart = now.getHours() * 60 + now.getMinutes() - GRID_START_H * 60;
    if (minutesFromStart < 0 || now.getHours() >= GRID_END_H) return null;
    return (minutesFromStart / 60) * PX_PER_HOUR;
  }, [isToday]);

  function openDetails(apt: Appointment) {
    setSelected(apt);
    setDetailsOpen(true);
  }

  return (
    <>
      <div className="flex flex-1 overflow-auto">
        {/* time gutter */}
        <div className="sticky left-0 z-10 w-16 border-r bg-background">
          <div className="h-16" />
          {timeSlots.map((t) => (
            <div
              key={t}
              className="flex h-20 items-start justify-end border-t px-2 py-1"
            >
              <span className="text-xs text-muted-foreground">{t}</span>
            </div>
          ))}
        </div>

        {/* staff columns */}
        <div className="flex flex-1">
          {staff.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              {t("calendar.noStaff")}
            </div>
          ) : (
            staff.map((member, idx) => {
              // Bookings with no assigned worker fall into the first staff column
              const colBookings = bookings.filter(
                (b) => b.workerId === member.id || (!b.workerId && idx === 0)
              );

              return (
                <div key={member.id} className="relative flex-1 border-r min-w-[140px]">
                  {/* column header */}
                  <div className="sticky top-0 z-10 flex h-16 items-center justify-center border-b bg-background">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-10 w-10 cursor-default">
                            <AvatarFallback className="font-semibold text-sm">
                              {initials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{member.name}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* grid rows */}
                  <div className="relative">
                    {timeSlots.map((t) => (
                      <div key={t} className="h-20 border-t" />
                    ))}

                    {/* "now" indicator */}
                    {nowLineTop !== null && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute left-1 right-1 z-50"
                        style={{ top: nowLineTop }}
                      >
                        <div className="h-px w-full bg-red-500/70" />
                        <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
                      </div>
                    )}

                    {/* booking cards */}
                    {colBookings.map((b) => {
                      const top = posFromISO(b.startAt);
                      const height = posFromISO(b.endAt) - top;
                      const isPast = isToday && new Date(b.endAt).getTime() < Date.now();

                      return (
                        <AppointmentCard
                          key={b.id}
                          apt={toAppointment(b)}
                          top={top}
                          height={Math.max(height, 28)}
                          muted={isPast}
                          onClick={() => openDetails(toAppointment(b))}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AppointmentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        appointment={selected}
        staff={staff}
        onDelete={async (id) => {
          await onDeleteBooking(id);
          setDetailsOpen(false);
          setSelected(null);
        }}
        onUpdate={async (data) => {
          await onUpdateBooking(data);
          setDetailsOpen(false);
          setSelected(null);
        }}
      />
    </>
  );
}
