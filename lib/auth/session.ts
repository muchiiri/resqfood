import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isFoodPreference, type ProfileValues } from "@/lib/profile/preferences";
import { isRole, type Role } from "./roles";

export type CurrentUser = { id: string; email: string; role: Role };

// Verifies the session with Supabase on every request instead of trusting the cookie alone.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  if (profileError || !isRole(profile?.role)) {
    throw new Error("Signed-in user has no valid profile row");
  }

  return { id: data.user.id, email: data.user.email ?? "", role: profile.role };
});

export type Profile = ProfileValues;

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("name, location, household_size, food_preferences, notify_expiry, notify_nearby, notify_claims")
    .eq("id", user.id)
    .single();
  if (error || !data) throw new Error("Could not load profile");

  return {
    name: data.name ?? "",
    location: data.location ?? "",
    householdSize: data.household_size == null ? "" : String(data.household_size),
    foodPreferences: (data.food_preferences as string[]).filter(isFoodPreference),
    notifications: { expiry: data.notify_expiry, nearby: data.notify_nearby, claims: data.notify_claims },
  };
});
