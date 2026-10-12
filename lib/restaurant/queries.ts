import "server-only";
import { cache } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DAY_KEYS, emptyHours, type OpeningHours, type RestaurantValues } from "./hours";

export function hoursToForm(stored: OpeningHours): RestaurantValues["hours"] {
  const hours = emptyHours();
  for (const day of DAY_KEYS) {
    const interval = stored[day];
    if (interval) hours[day] = { closed: false, open: interval.open, close: interval.close };
  }
  return hours;
}

export const getRestaurant = cache(async (): Promise<RestaurantValues | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("business_name, address, opening_hours")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Could not load restaurant");
  if (!data) return null;

  return {
    businessName: data.business_name,
    address: data.address,
    hours: hoursToForm(data.opening_hours as OpeningHours),
  };
});
