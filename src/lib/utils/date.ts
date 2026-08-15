const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** "YYYY-MM-DD" in local time — `toISOString()` would shift the date by the UTC offset. */
export function toDateInput(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function today(): string {
  return toDateInput(new Date());
}

export function addDays(days: number, from: Date = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}

/** Parses "YYYY-MM-DD" as a local date, avoiding the UTC-midnight parsing trap. */
export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function weekdayName(value: string): string | null {
  const date = parseDateInput(value);
  return date ? WEEKDAYS[date.getDay()] : null;
}

export function formatDate(value: string): string {
  const date = parseDateInput(value);
  if (!date) return value;
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "14:30" -> "02:30 PM" */
export function formatTime(value: string): string {
  const [hourPart, minutePart] = value.split(":");
  const hour = Number(hourPart);
  if (Number.isNaN(hour)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${`${displayHour}`.padStart(2, "0")}:${minutePart} ${suffix}`;
}
