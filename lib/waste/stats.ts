// Pure helpers for the waste stats page. Saved = eaten + shared; wasted = thrown away.

export type StatsAmounts = {
  eatenKg: number;
  sharedKg: number;
  wastedKg: number;
  eatenValue: number;
  sharedValue: number;
  wastedValue: number;
};
export type StatsTotals = StatsAmounts & {
  entries: number;
  entriesWithoutWeight: number;
  entriesWithoutValue: number;
};
export type MonthlyStats = StatsAmounts & { monthStart: string };

export const STATS_MONTHS = 6;

const round2 = (n: number) => Math.round(n * 100) / 100;

export const savedKg = (a: StatsAmounts) => round2(a.eatenKg + a.sharedKg);
export const savedValue = (a: StatsAmounts) => round2(a.eatenValue + a.sharedValue);

export const formatKg = (kg: number) => `${Number(round2(kg).toFixed(2))} kg`;
export const formatAed = (aed: number) => `AED ${round2(aed).toFixed(2)}`;

// "2026-10-01" gives "Oct 2026". Built from UTC parts of the date text, so the viewer's time zone never shifts it.
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
export function monthLabel(monthStart: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(monthStart)) return monthStart;
  return monthFormat.format(new Date(`${monthStart}T00:00:00Z`));
}

export type KgChartRow = { month: string; eaten: number; shared: number; wasted: number };
export type ValueChartRow = { month: string; saved: number; wasted: number };

export const kgChartRows = (rows: MonthlyStats[]): KgChartRow[] =>
  rows.map((r) => ({
    month: monthLabel(r.monthStart),
    eaten: round2(r.eatenKg),
    shared: round2(r.sharedKg),
    wasted: round2(r.wastedKg),
  }));

export const valueChartRows = (rows: MonthlyStats[]): ValueChartRow[] =>
  rows.map((r) => ({ month: monthLabel(r.monthStart), saved: savedValue(r), wasted: round2(r.wastedValue) }));

// Says how many log entries are missing data, or null when nothing is missing.
export function missingDataNote(totals: StatsTotals): string | null {
  const { entries, entriesWithoutWeight: noWeight, entriesWithoutValue: noValue } = totals;
  if (noWeight === 0 && noValue === 0) return null;
  const noun = entries === 1 ? "entry has" : "entries have";
  return `${noWeight} of ${entries} ${noun} no weight and ${noValue} ${noValue === 1 ? "has" : "have"} no value, so they are not counted in the kg and AED totals.`;
}
