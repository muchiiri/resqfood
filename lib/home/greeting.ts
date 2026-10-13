import type { Role } from "@/lib/auth/roles";

export type PartOfDay = "morning" | "afternoon" | "evening";

// 5 to 11 morning, 12 to 17 afternoon, everything else evening.
export function partOfDay(hour: number): PartOfDay {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

const hourFormat = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hour: "numeric", hourCycle: "h23" });

// The hour (0 to 23) in UAE time. Call it from a server component after request data has been read.
export const dubaiHour = (now: Date): number => Number(hourFormat.format(now));

export const WELCOME_LINES: Record<Role, string> = {
  student: "Find food near campus, keep track of your fridge and cut waste.",
  household: "Keep track of what you have, plan portions and pass on what you will not use.",
  restaurant: "Share end-of-day surplus and keep an eye on your listings.",
};

// "Good morning, Aisha" or "Good morning" when there is no name. The name is user text: render it as plain text.
export function greetingText(part: PartOfDay, name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  return trimmed ? `Good ${part}, ${trimmed}` : `Good ${part}`;
}
