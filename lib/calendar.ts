// lib/calendar.ts
import type { Appointment, Staff } from "@/lib/types";

function hhmm(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function mapStaff(
  prismaStaff: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    color: string;
    startTime: string;
    endTime: string;
  }>
): Staff[] {
  return prismaStaff.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    avatar: s.avatar ?? "",
    color: s.color,
    isActive: true,
    phone: s.phone ?? "",
    startTime: s.startTime,
    endTime: s.endTime,
  }));
}

export function mapAppointments(
  prismaApts: Array<{
    id: string;
    staffId: string;
    startTime: Date;
    endTime: Date;
    client: { name: string } | null;
    service: { name: string; color: string } | null;
  }>
): Appointment[] {
  return prismaApts.map((a) => ({
    id: a.id,
    staffId: a.staffId,

    start: a.startTime.toISOString(),
    end: a.endTime.toISOString(),

    startTime: hhmm(a.startTime),
    endTime: hhmm(a.endTime),

    clientName: a.client?.name ?? "Client",
    serviceName: a.service?.name ?? "Service",
    color: a.service?.color ?? "#e5e7eb",
  }));
}
