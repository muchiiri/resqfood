"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { DAY_KEYS, emptyHours, type RestaurantValues } from "@/lib/restaurant/hours";
import { validateRestaurant, type RestaurantFieldErrors } from "@/lib/restaurant/validation";

export type RestaurantState = {
  values: RestaurantValues;
  error?: string;
  fieldErrors?: RestaurantFieldErrors;
  saved?: boolean;
};

const GENERIC_ERROR = "Something went wrong. Please try again.";

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export async function saveRestaurant(_prev: RestaurantState, formData: FormData): Promise<RestaurantState> {
  const hours = emptyHours();
  for (const day of DAY_KEYS) {
    hours[day] = {
      closed: formData.get(`closed_${day}`) === "on",
      open: text(formData, `open_${day}`),
      close: text(formData, `close_${day}`),
    };
  }
  const values: RestaurantValues = {
    businessName: text(formData, "businessName"),
    address: text(formData, "address"),
    hours,
  };

  const user = await getCurrentUser();
  if (!user) return { values, error: "Please log in again." };
  if (user.role !== "restaurant") return { values, error: "Only restaurant accounts can add business details." };

  const { fieldErrors, valid } = validateRestaurant(values);
  if (!valid) return { values, fieldErrors };

  const row = {
    business_name: valid.businessName,
    address: valid.address,
    opening_hours: valid.openingHours,
  };

  const supabase = await createClient();
  const existing = await supabase.from("restaurants").select("id").eq("owner_id", user.id).maybeSingle();
  if (existing.error) return { values, error: GENERIC_ERROR };

  const write = existing.data
    ? await supabase.from("restaurants").update(row).eq("owner_id", user.id).select("id")
    : await supabase.from("restaurants").insert({ ...row, owner_id: user.id }).select("id");

  if (write.error || !write.data || write.data.length !== 1) return { values, error: GENERIC_ERROR };
  return { values, saved: true };
}
