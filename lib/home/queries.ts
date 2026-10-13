import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveClaims } from "@/lib/claims/queries";
import type { ClaimStatus } from "@/lib/claims/types";
import type { ListingStatus } from "@/lib/listings/types";
import { getUnreadCount } from "@/lib/notifications/queries";
import { todayInDubai } from "@/lib/pantry/expiry";
import { listExpiringItems } from "@/lib/pantry/queries";
import { createClient } from "@/lib/supabase/server";
import { STATS_MONTHS } from "@/lib/waste/stats";
import { getWasteStats } from "@/lib/waste/stats-queries";
import type { MonthlyStats, StatsTotals } from "@/lib/waste/stats";
import {
  CLAIM_STATUSES,
  countByStatus,
  expiringCounts,
  LISTING_STATUSES,
  savedThisMonthKg,
} from "./summary";

const ROW_CAP = 1000;

export type HomeData = {
  listings: Record<ListingStatus, number>;
  claims: Record<ClaimStatus, number>;
  expiring: { today: number; soon: number };
  nextPickup: string | null;
  unread: number;
  savedThisMonthKg: number;
  monthly: MonthlyStats[];
  totals: StatsTotals;
};

// Everything the Home dashboard shows, for the signed-in user only. The clock is read after the session lookup.
export async function getHomeData(): Promise<HomeData | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const today = todayInDubai();

  const supabase = await createClient();
  const [listingRows, claimRows, expiringItems, activeClaimList, unread, stats] = await Promise.all([
    supabase.from("listings").select("status").eq("poster_id", user.id).limit(ROW_CAP),
    supabase.from("claims").select("status").eq("claimer_id", user.id).limit(ROW_CAP),
    listExpiringItems(today),
    getActiveClaims(),
    getUnreadCount(),
    getWasteStats(STATS_MONTHS),
  ]);
  if (listingRows.error || claimRows.error || !stats) throw new Error("Could not load your dashboard");

  return {
    listings: countByStatus(listingRows.data as { status: string }[], LISTING_STATUSES),
    claims: countByStatus(claimRows.data as { status: string }[], CLAIM_STATUSES),
    expiring: expiringCounts(expiringItems, today),
    nextPickup: activeClaimList[0]?.availableUntil ?? null,
    unread,
    savedThisMonthKg: savedThisMonthKg(stats.monthly),
    monthly: stats.monthly,
    totals: stats.totals,
  };
}
