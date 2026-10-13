"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getListing } from "@/lib/listings/queries";
import type { ListingValues } from "@/lib/listings/types";
import { isJpeg, MAX_PHOTO_BYTES, validateListing, type ListingFieldErrors } from "@/lib/listings/validation";
import { isUuid } from "@/lib/pantry/validation";
import { createClient } from "@/lib/supabase/server";

export type ListingState = {
  values: ListingValues;
  error?: string;
  fieldErrors?: ListingFieldErrors;
  photoError?: string;
};
export type WithdrawState = { error?: string };

const BUCKET = "listing-photos";
const GENERIC_ERROR = "Something went wrong. Please try again.";
const RESTAURANT_PROFILE_ERROR = "Add your restaurant details on your profile before sharing food.";

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export async function createListing(_prev: ListingState, formData: FormData): Promise<ListingState> {
  const values: ListingValues = {
    title: text(formData, "title"),
    category: text(formData, "category"),
    quantity: text(formData, "quantity"),
    unit: text(formData, "unit"),
    description: text(formData, "description"),
    pickupArea: text(formData, "pickupArea"),
    pickupDetails: text(formData, "pickupDetails"),
    availableUntil: text(formData, "availableUntil"),
  };

  const user = await getCurrentUser();
  if (!user) return { values, error: "Please log in again." };

  const { fieldErrors, valid } = validateListing(values, Date.now());

  const photo = formData.get("photo");
  const photoFile = photo instanceof File && photo.size > 0 ? photo : null;
  let photoBytes: Uint8Array | null = null;
  let photoError: string | undefined;
  if (photoFile) {
    if (photoFile.size > MAX_PHOTO_BYTES) photoError = "Choose a photo under 2 MB.";
    else {
      photoBytes = new Uint8Array(await photoFile.arrayBuffer());
      if (!isJpeg(photoBytes)) photoError = "Choose a JPEG photo.";
    }
  }

  if (!valid || photoError) return { values, fieldErrors, photoError };

  const supabase = await createClient();
  let photoPath: string | null = null;

  if (photoBytes) {
    photoPath = `${user.id}/${randomUUID()}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(photoPath, photoBytes, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) return { values, error: GENERIC_ERROR };
  }

  const { data: id, error } = await supabase.rpc("create_listing", {
    p_title: valid.title,
    p_description: valid.description,
    p_category: valid.category,
    p_quantity: valid.quantity,
    p_unit: valid.unit,
    p_photo_path: photoPath,
    p_pickup_area: valid.pickupArea,
    p_pickup_details: valid.pickupDetails,
    p_available_until: valid.availableUntilIso,
  });

  if (error || typeof id !== "string") {
    if (photoPath) await supabase.storage.from(BUCKET).remove([photoPath]);
    const needsProfile = error?.message?.includes("restaurant_profile_required");
    return { values, error: needsProfile ? RESTAURANT_PROFILE_ERROR : GENERIC_ERROR };
  }

  revalidatePath("/listings");
  redirect(`/listings/${id}`);
}

export async function withdrawListing(id: string): Promise<WithdrawState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (!isUuid(id)) return { error: GENERIC_ERROR };

  const listing = await getListing(id);
  if (!listing || listing.posterId !== user.id) return { error: GENERIC_ERROR };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("poster_id", user.id)
    .eq("status", "available")
    .select("id");
  if (error || !data || data.length !== 1) return { error: GENERIC_ERROR };

  if (listing.photoPath) await supabase.storage.from(BUCKET).remove([listing.photoPath]);

  revalidatePath("/listings");
  redirect("/listings");
}
