import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
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
