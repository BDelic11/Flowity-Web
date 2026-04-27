export type NextAppointment = {
  clientName: string;
  serviceName: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  staffName: string | null;
};

export type SalonMetrics = {
  todaysAppointmentsCount: number;
  weeksAppointmentsCount: number;
  activeStaffCount: number;
  todaysRevenue: number;
  nextAppointment: NextAppointment | null;
};
