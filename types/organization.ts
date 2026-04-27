export type BusinessHourRow = {
  day: string;
  enabled: boolean;
  open: string;
  close: string;
};

export type OrganizationData = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  industry: string;
  timeZone: string;
  autoConfirmBookings: boolean;
  bufferMinBetweenAppointments: number;
  maxAdvanceDays: number;
  minLeadTimeMin: number;
  businessHours: BusinessHourRow[];
};
