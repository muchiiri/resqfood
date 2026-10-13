import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { isCategory, isUnit } from "@/lib/pantry/items";
import { isUuid } from "@/lib/pantry/validation";
import { createClient } from "@/lib/supabase/server";
import { isListingStatus, type Listing } from "./types";

export const COLUMNS =
  "id, poster_id, title, description, category, quantity, unit, photo_path, pickup_area, available_until, status, created_at";

export type Row = {
  id: string;
  poster_id: string;
  title: string;
  description: string | null;
  category: string;
  quantity: number | string;
  unit: string;
  photo_path: string | null;
  pickup_area: string;
  available_until: string;
  status: string;
  created_at: string;
};

export function toListing(row: Row): Listing {
  if (!isCategory(row.category) || !isUnit(row.unit) || !isListingStatus(row.status)) {
    throw new Error("Listing row has an unexpected value");
  }
  return {
    id: row.id,
    posterId: row.poster_id,
    title: row.title,
    description: row.description,
    category: row.category,
    quantity: Number(row.quantity),
    unit: row.unit,
    photoPath: row.photo_path,
    pickupArea: row.pickup_area,
    availableUntil: row.available_until,
    status: row.status,
    createdAt: row.created_at,
  };
}

export const photoUrl = (path: string): string =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-photos/${path}`;

// Row level security decides what the viewer may see: their own listings, or available ones.
export async function getListing(id: string): Promise<Listing | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("listings").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error("Could not load listing");
  return data ? toListing(data as Row) : null;
}

// Only the poster can read these rows; anyone else gets null.
export async function getPickupDetails(id: string): Promise<string | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("listing_pickup_details").select("details").eq("listing_id", id).maybeSingle();
  if (error) throw new Error("Could not load pickup details");
  return data?.details ?? null;
}

export async function listMyListings(): Promise<Listing[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(COLUMNS)
    .eq("poster_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load your listings");
  return (data as Row[]).map(toListing);
}
