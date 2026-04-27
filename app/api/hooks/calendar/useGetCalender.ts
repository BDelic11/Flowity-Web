import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";
import { CalendarData, CalendarBooking, CalendarStaff } from "@/types/calendar";
import { format, parseISO } from "date-fns";

// Times are stored as local wall-clock time (TIMESTAMP WITHOUT TIME ZONE).
// The backend serialises them without a timezone suffix, so the browser treats
// them as local time — which is exactly what we want. No UTC conversion needed.
const toHHMM = (iso: string) => format(parseISO(iso), "HH:mm");

const fetchCalendar = async (
  organizationId: string,
  date: Date
): Promise<CalendarData> => {
  const dateStr = format(date, "yyyy-MM-dd");
  const response = await api.get(
    `${apiRoutes.calendar}?organizationId=${organizationId}&date=${dateStr}`
  );

  const raw = response.data;

  const staff: CalendarStaff[] = (raw.staff ?? []).map((s: any) => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    name: `${s.firstName} ${s.lastName}`.trim(),
  }));

  const bookings: CalendarBooking[] = (raw.bookings ?? []).map((b: any) => ({
    id: b.id,
    workerId: b.workerId ?? null,
    clientName: b.clientName,
    serviceName: b.serviceName,
    serviceId: b.serviceId,
    color: b.color ?? "#3b82f6",
    startAt: b.startAt,
    endAt: b.endAt,
    startTime: toHHMM(b.startAt),
    endTime: toHHMM(b.endAt),
    status: b.status,
    notes: b.notes ?? null,
  }));

  return { staff, bookings };
};

export const useGetCalendar = (
  organizationId: string | null | undefined,
  date: Date
) => {
  const dateStr = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["calendar", organizationId, dateStr],
    queryFn: () => fetchCalendar(organizationId!, date),
    enabled: !!organizationId,
    // Poll every 30s so WhatsApp bookings and other external changes appear automatically.
    // refetchOnWindowFocus picks up changes when the user tabs back to the app.
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });
};
