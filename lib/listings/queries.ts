import "server-only";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isCategory, isUnit } from "@/lib/pantry/items";
import { isUuid } from "@/lib/pantry/validation";
import { createClient } from "@/lib/supabase/server";
import { isListingStatus, type Listing } from "./types";

export const COLUMNS =
  "id, poster_id, restaurant_id, title, description, category, quantity, unit, photo_path, pickup_area, available_until, status, created_at, restaurants(business_name)";

export type Row = {
  id: string;
  poster_id: string;
  restaurant_id: string | null;
  // A to-one embed arrives as an object; the client types describe it as a list, so accept both.
  restaurants: { business_name: string } | { business_name: string }[] | null;
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
    restaurantId: row.restaurant_id,
    restaurantName: (Array.isArray(row.restaurants) ? row.restaurants[0] : row.restaurants)?.business_name ?? null,
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

// The viewer's own listings that are still on offer (available, or claimed and waiting for handover),
// soonest end time first. connection() keeps the clock read below out of prerendering and prefetching.
export async function listActivePostings(): Promise<Listing[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(COLUMNS)
    .eq("poster_id", user.id)
    .in("status", ["available", "claimed"])
    .gt("available_until", new Date().toISOString())
    .order("available_until", { ascending: true })
    .limit(10);
  if (error) throw new Error("Could not load your listings");
  return (data as Row[]).map(toListing);
}
