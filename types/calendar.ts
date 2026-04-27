export type CalendarStaff = {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // computed: firstName + lastName
};

export type CalendarBooking = {
  id: string;
  workerId: string | null;
  clientName: string;
  serviceName: string;
  serviceId: string;
  color: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  startTime: string; // "HH:mm" computed from startAt
  endTime: string;   // "HH:mm" computed from endAt
  status: string;
  notes?: string | null;
};

export type CalendarData = {
  staff: CalendarStaff[];
  bookings: CalendarBooking[];
};

// Shared option types used by appointment dialogs
export type StaffOption = { id: string; name: string };
export type ServiceOption = {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  workerIds: string[]; // staff who can perform this service
};
