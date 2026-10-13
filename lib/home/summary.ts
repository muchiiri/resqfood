import { CLAIM_STATUS_LABELS, type ClaimStatus } from "@/lib/claims/types";
import { LISTING_STATUS_LABELS, type ListingStatus } from "@/lib/listings/types";
import { getExpiryStatus } from "@/lib/pantry/expiry";
import { savedKg, type MonthlyStats } from "@/lib/waste/stats";

export const LISTING_STATUSES = ["available", "claimed", "collected", "expired"] as const satisfies readonly ListingStatus[];
export const CLAIM_STATUSES = ["pending", "collected", "cancelled"] as const satisfies readonly ClaimStatus[];

// Counts rows per known status. Rows with an unknown status are ignored.
export function countByStatus<T extends string>(rows: { status: string }[], keys: readonly T[]): Record<T, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
  for (const row of rows) {
    if ((keys as readonly string[]).includes(row.status)) counts[row.status as T] += 1;
  }
  return counts;
}

export type StatusChartRow = { status: string; label: string; count: number };

export const listingChartRows = (counts: Record<ListingStatus, number>): StatusChartRow[] =>
  LISTING_STATUSES.map((status) => ({ status, label: LISTING_STATUS_LABELS[status], count: counts[status] }));

export const claimChartRows = (counts: Record<ClaimStatus, number>): StatusChartRow[] =>
  CLAIM_STATUSES.map((status) => ({ status, label: CLAIM_STATUS_LABELS[status], count: counts[status] }));

export const activeListings = (counts: Record<ListingStatus, number>) => counts.available + counts.claimed;
export const activeClaims = (counts: Record<ClaimStatus, number>) => counts.pending;
export const totalCount = (rows: StatusChartRow[]) => rows.reduce((sum, row) => sum + row.count, 0);

// Pantry items expiring today versus in 1 to 3 days. Expired and fresh items are not counted.
export function expiringCounts(items: { expiresAt: string }[], today: string): { today: number; soon: number } {
  let todayCount = 0;
  let soonCount = 0;
  for (const item of items) {
    const { status } = getExpiryStatus(item.expiresAt, today);
    if (status === "today") todayCount += 1;
    else if (status === "soon") soonCount += 1;
  }
  return { today: todayCount, soon: soonCount };
}

// Eaten plus shared in the newest month of the series (the current month), or 0 when there is none.
export function savedThisMonthKg(monthly: MonthlyStats[]): number {
  const latest = monthly[monthly.length - 1];
  return latest ? savedKg(latest) : 0;
}
