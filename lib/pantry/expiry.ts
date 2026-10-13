export const SOON_WINDOW_DAYS = 3;
export const EXPIRY_TIME_ZONE = "Asia/Dubai";

export type ExpiryStatus = "expired" | "today" | "soon" | "fresh";

const dubaiFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: EXPIRY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// The calendar date in UAE time as YYYY-MM-DD.
export const dubaiDate = (now: Date): string => dubaiFormat.format(now);

// Reads the clock: call only in a server component after request data has been read.
export const todayInDubai = (): string => dubaiDate(new Date());

function dayNumber(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

export function getExpiryStatus(expiresAt: string, today: string): { status: ExpiryStatus; daysLeft: number } {
  const daysLeft = dayNumber(expiresAt) - dayNumber(today);
  if (daysLeft < 0) return { status: "expired", daysLeft };
  if (daysLeft === 0) return { status: "today", daysLeft };
  if (daysLeft <= SOON_WINDOW_DAYS) return { status: "soon", daysLeft };
  return { status: "fresh", daysLeft };
}

// Adds whole days to a YYYY-MM-DD date without reading the clock.
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}
