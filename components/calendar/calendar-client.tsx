"use client";

import { useState } from "react";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { useGetCalendar } from "@/app/api/hooks/calendar/useGetCalender";
import { useCreateBooking } from "@/app/api/hooks/bookings/useCreateBooking";
import { useDeleteBooking } from "@/app/api/hooks/bookings/useDeleteBooking";
import { useUpdateBooking } from "@/app/api/hooks/bookings/useUpdateBooking";
import { useGetServices } from "@/app/api/hooks/services/useGetServices";
import { toast } from "sonner";
import type { StaffOption, ServiceOption } from "@/types/calendar";
import { useLocale } from "@/contexts/locale-context";

type Props = {
  organizationId: string;
  /** When set (Worker role), calendar shows only this staff member's column and bookings. */
  workerFilter?: string;
};

export function CalendarClient({ organizationId, workerFilter }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { t } = useLocale();

  const { data: calendarData, isFetching } = useGetCalendar(organizationId, currentDate);
  const { data: services } = useGetServices(organizationId);
  const { mutateAsync: createBooking } = useCreateBooking();
  const { mutateAsync: deleteBooking } = useDeleteBooking();
  const { mutateAsync: updateBooking } = useUpdateBooking();

  const allStaff = calendarData?.staff ?? [];
  const allBookings = calendarData?.bookings ?? [];

  // Workers see only their own column and bookings
  const staff = workerFilter
    ? allStaff.filter((s) => s.id === workerFilter)
    : allStaff;

  const bookings = workerFilter
    ? allBookings.filter((b) => b.workerId === workerFilter)
    : allBookings;

  const staffOptions: StaffOption[] = staff.map((s) => ({
    id: s.id,
    name: s.name,
  }));

  const serviceOptions: ServiceOption[] = (services ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    duration: s.durationMin,
    price: s.priceMin ?? 0,
    workerIds: s.workerIds ?? [],
  }));

  async function handleDeleteBooking(id: string) {
    try {
      await deleteBooking(id);
      toast.success(t("calendar.appointmentDeleted"));
    } catch {
      toast.error(t("calendar.failedToDelete"));
    }
  }

  async function handleUpdateBooking(data: {
    bookingId: string;
    clientName: string;
    startAt: string;
    endAt: string;
    workerId?: string | null;
    notes?: string | null;
  }) {
    try {
      await updateBooking(data);
      toast.success(t("calendar.appointmentUpdated"));
    } catch {
      toast.error(t("calendar.failedToUpdate"));
    }
  }

  async function handleCreateBooking(payload: {
    clientName: string;
    staffId: string;
    serviceId: string;
    startISO: string;
    endISO: string;
    notes?: string | null;
  }) {
    try {
      await createBooking({
        organizationId,
        clientName: payload.clientName,
        serviceCatalogItemId: payload.serviceId,
        // Workers can only create bookings assigned to themselves
        workerId: workerFilter ?? payload.staffId ?? null,
        startAt: payload.startISO,
        endAt: payload.endISO,
        notes: payload.notes,
      });
      toast.success(t("calendar.appointmentCreated"));
    } catch {
      toast.error(t("calendar.failedToCreate"));
    }
  }

  return (
    <div className="flex h-full flex-col">
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        isPending={isFetching}
        staffOptions={staffOptions}
        serviceOptions={serviceOptions}
        onCreateBooking={handleCreateBooking}
      />
      <div className={isFetching ? "flex-1 opacity-60 transition-opacity overflow-hidden" : "flex-1 overflow-hidden"}>
        <CalendarGrid
          staff={staff}
          bookings={bookings}
          currentDate={currentDate}
          onDeleteBooking={handleDeleteBooking}
          onUpdateBooking={handleUpdateBooking}
        />
      </div>
    </div>
  );
}
