"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  NOTIFICATION_KEYS,
  isFoodPreference,
  type Notifications,
  type ProfileValues,
} from "@/lib/profile/preferences";
import { validateProfile, type ProfileFieldErrors } from "@/lib/profile/validation";

export type ProfileState = {
  values: ProfileValues;
  error?: string;
  fieldErrors?: ProfileFieldErrors;
  saved?: boolean;
};

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export async function updateProfile(prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const submitted = {
    name: text(formData, "name"),
    location: text(formData, "location"),
    householdSize: text(formData, "householdSize"),
    foodPreferences: formData.getAll("foodPreferences").filter((v): v is string => typeof v === "string"),
  };
  const notifications = Object.fromEntries(
    NOTIFICATION_KEYS.map((key) => [key, formData.get(`notify_${key}`) === "on"]),
  ) as Notifications;
  const values: ProfileValues = {
    ...submitted,
    foodPreferences: submitted.foodPreferences.filter(isFoodPreference),
    notifications,
  };

  const user = await getCurrentUser();
  if (!user) return { values, error: "Please log in again." };

  const { fieldErrors, valid } = validateProfile(submitted);
  if (!valid) return { values, fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: valid.name,
      location: valid.location,
      household_size: user.role === "restaurant" ? null : valid.householdSize,
      food_preferences: valid.foodPreferences,
      notify_expiry: notifications.expiry,
      notify_nearby: notifications.nearby,
      notify_claims: notifications.claims,
    })
    .eq("id", user.id)
    .select("id");

  if (error || !data || data.length !== 1) return { values, error: "Something went wrong. Please try again." };
  return { values, saved: true };
}
