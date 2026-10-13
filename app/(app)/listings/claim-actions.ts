"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { isUuid } from "@/lib/pantry/validation";
import { createClient } from "@/lib/supabase/server";

export type ClaimState = { error?: string; message?: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

// Only these database messages are safe and useful to show; anything else stays generic.
const KNOWN_ERRORS: Record<string, string> = {
  listing_unavailable: "This listing is no longer available.",
  claim_limit: "You can hold at most 2 claims at once.",
  claim_unavailable: "This claim is no longer active.",
};

function messageFor(error: { message?: string }): string {
  const known = Object.keys(KNOWN_ERRORS).find((key) => error.message?.includes(key));
  return known ? KNOWN_ERRORS[known] : GENERIC_ERROR;
}

async function run(
  fn: "claim_listing" | "cancel_claim" | "confirm_collected",
  args: { p_listing_id: string } | { p_claim_id: string },
  id: string,
  success: string,
): Promise<ClaimState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (!isUuid(id)) return { error: GENERIC_ERROR };

  const supabase = await createClient();
  const { error } = await supabase.rpc(fn, args);
  if (error) return { error: messageFor(error) };

  revalidatePath("/", "layout");
  return { message: success };
}

export async function claimListing(listingId: string): Promise<ClaimState> {
  return run("claim_listing", { p_listing_id: listingId }, listingId, "Claimed. The pickup details are below.");
}

export async function cancelClaim(claimId: string): Promise<ClaimState> {
  return run("cancel_claim", { p_claim_id: claimId }, claimId, "Claim cancelled.");
}

export async function confirmCollected(claimId: string): Promise<ClaimState> {
  return run("confirm_collected", { p_claim_id: claimId }, claimId, "Marked as collected.");
}
