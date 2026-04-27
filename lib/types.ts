export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface TenantSettings {
  dayStart: string;
  dayEnd: string;
  intervalMin: number;
  pxPerHour: number;
  showClosedGaps: boolean;
}

export interface Appointment {
  id: string;
  staffId: string;
  clientId?: string;
  serviceId?: string;

  start: string;
  end: string;

  startTime: string; // "09:00"
  endTime: string; // "10:15"

  clientName: string;
  serviceName: string;
  status?: AppointmentStatus;
  color: string;
  notes?: string | null;
}

/** @deprecated Use Appointment */
export type Booking = Appointment;

export interface Staff {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  color: string;
}

export interface CalendarView {
  type: "day" | "week" | "month";
  date: Date;
}
