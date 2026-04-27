export function isoOnDate(baseDate: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    h,
    m,
    0,
    0
  );
  return d.toISOString();
}
