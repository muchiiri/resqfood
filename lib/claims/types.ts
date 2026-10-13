export type ClaimStatus = "pending" | "collected" | "cancelled";

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  pending: "Waiting for pickup",
  collected: "Collected",
  cancelled: "Cancelled",
};

export const isClaimStatus = (v: unknown): v is ClaimStatus =>
  typeof v === "string" && Object.keys(CLAIM_STATUS_LABELS).includes(v);

export type Claim = {
  id: string;
  listingId: string;
  claimerId: string;
  status: ClaimStatus;
  claimedAt: string;
  resolvedAt: string | null;
};

// A claim together with the listing facts the lists and the shell need.
export type ClaimSummary = Claim & {
  title: string;
  pickupArea: string;
  availableUntil: string;
};
