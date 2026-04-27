export const DEFAULT_BUSINESS_HOURS = [
  { day: "Monday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Tuesday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Wednesday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Thursday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Friday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Saturday", enabled: true, open: "09:00", close: "18:00" },
  { day: "Sunday", enabled: false, open: "09:00", close: "18:00" },
] as const;

export const DEFAULT_NOTIFICATION_PREFS = {
  email: true,
  sms: false,
  types: {
    newBooking: true,
    cancellations: true,
    reminders: true,
  },
} as const;

export const DEFAULT_SETTINGS = {
  timezone: "Europe/Zagreb",
  locale: "en",
  weekStartsOn: 1,
  dayStart: "09:00",
  dayEnd: "18:00",
  intervalMin: 60,
  pxPerHour: 80,
  snapToInterval: true,
  showClosedGaps: false,
  showWeekends: true,
  defaultView: "DAY" as const,

  // Booking defaults (the ones y
  autoConfirmBookings: true,
  bufferMinBetweenAppointments: 0,
  minLeadTimeMin: 0,
  maxAdvanceDays: 90,

  allowOverlaps: false,

  // JSON blobs
  businessHours: DEFAULT_BUSINESS_HOURS,
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,

  // optional contact fields if you added them to TenantSettings
  contactEmail: null as string | null,
  phone: null as string | null,
  address: null as string | null,
};
