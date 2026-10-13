import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { isUuid } from "@/lib/pantry/validation";
import { createClient } from "@/lib/supabase/server";
import { isClaimStatus, type Claim, type ClaimSummary } from "./types";

const CLAIM_COLUMNS = "id, listing_id, claimer_id, status, claimed_at, resolved_at";
const SUMMARY_COLUMNS = `${CLAIM_COLUMNS}, listings(title, pickup_area, available_until)`;

type ClaimRow = {
  id: string;
  listing_id: string;
  claimer_id: string;
  status: string;
  claimed_at: string;
  resolved_at: string | null;
};

type SummaryRow = ClaimRow & {
  listings: { title: string; pickup_area: string; available_until: string } | null;
};

function toClaim(row: ClaimRow): Claim {
  if (!isClaimStatus(row.status)) throw new Error("Claim row has an unexpected value");
  return {
    id: row.id,
    listingId: row.listing_id,
    claimerId: row.claimer_id,
    status: row.status,
    claimedAt: row.claimed_at,
    resolvedAt: row.resolved_at,
  };
}

// A claim whose listing the viewer can no longer read is dropped rather than shown half empty.
function toSummary(row: SummaryRow): ClaimSummary | null {
  if (!row.listings) return null;
  return {
    ...toClaim(row),
    title: row.listings.title,
    pickupArea: row.listings.pickup_area,
    availableUntil: row.listings.available_until,
  };
}

const summaries = (rows: SummaryRow[]) => rows.map(toSummary).filter((c): c is ClaimSummary => c !== null);

// The viewer's own pending claim on a listing, or the most recent resolved one.
export async function getViewerClaim(listingId: string): Promise<Claim | null> {
  if (!isUuid(listingId)) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("claims")
    .select(CLAIM_COLUMNS)
    .eq("listing_id", listingId)
    .eq("claimer_id", user.id)
    .order("claimed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Could not load your claim");
  return data ? toClaim(data as ClaimRow) : null;
}

// The pending claim on a listing the viewer owns, if there is one. Row level security lets the
// poster read it, and it holds no claimer details the poster should see.
export async function getPendingClaimOnListing(listingId: string): Promise<Claim | null> {
  if (!isUuid(listingId)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("claims")
    .select(CLAIM_COLUMNS)
    .eq("listing_id", listingId)
    .eq("status", "pending")
    .maybeSingle();
  if (error) throw new Error("Could not load the claim");
  return data ? toClaim(data as ClaimRow) : null;
}

const PAST_LIMIT = 20;

// Active claims first (a person holds at most 2), then the latest past ones.
export async function listMyClaims(): Promise<{ active: ClaimSummary[]; past: ClaimSummary[] }> {
  const user = await getCurrentUser();
  if (!user) return { active: [], past: [] };

  const supabase = await createClient();
  const [activeResult, pastResult] = await Promise.all([
    supabase
      .from("claims")
      .select(SUMMARY_COLUMNS)
      .eq("claimer_id", user.id)
      .eq("status", "pending")
      .order("claimed_at", { ascending: false }),
    supabase
      .from("claims")
      .select(SUMMARY_COLUMNS)
      .eq("claimer_id", user.id)
      .neq("status", "pending")
      .order("resolved_at", { ascending: false })
      .limit(PAST_LIMIT),
  ]);
  if (activeResult.error || pastResult.error) throw new Error("Could not load your claims");
  return {
    active: summaries(activeResult.data as unknown as SummaryRow[]),
    past: summaries(pastResult.data as unknown as SummaryRow[]),
  };
}

// For the shell: the viewer's active claims, soonest end time first.
export async function getActiveClaims(): Promise<ClaimSummary[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("claims")
    .select(SUMMARY_COLUMNS)
    .eq("claimer_id", user.id)
    .eq("status", "pending");
  if (error) throw new Error("Could not load your claims");
  return summaries(data as unknown as SummaryRow[]).sort(
    (a, b) => new Date(a.availableUntil).getTime() - new Date(b.availableUntil).getTime(),
  );
}
