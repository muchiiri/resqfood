"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { isUuid } from "@/lib/pantry/validation";
import { planPortions } from "@/lib/portions/plan";
import { validatePortion, type PortionFieldErrors, type PortionValues } from "@/lib/portions/validation";
import { createClient } from "@/lib/supabase/server";

export type PlanState = { error?: string; fieldErrors?: PortionFieldErrors; message?: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

// The client sends only the inputs. The recommendation is recomputed here and never taken from the client.
export async function savePlan(values: PortionValues): Promise<PlanState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };

  const input: PortionValues = {
    people: typeof values?.people === "string" ? values.people : "",
    hunger: typeof values?.hunger === "string" ? values.hunger : "",
    preferences: Array.isArray(values?.preferences) ? values.preferences.filter((p) => typeof p === "string") : [],
  };
  const { fieldErrors, valid } = validatePortion(input);
  if (!valid) return { fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("portion_plans").insert({
    user_id: user.id,
    people: valid.people,
    hunger_level: valid.hunger,
    preferences: valid.preferences,
    suggestion: planPortions(valid),
  });
  if (error) return { error: GENERIC_ERROR };

  revalidatePath("/plan");
  return { message: "Plan saved." };
}

export async function deletePlan(id: string): Promise<PlanState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (typeof id !== "string" || !isUuid(id)) return { error: GENERIC_ERROR };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portion_plans")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (error || !data || data.length !== 1) return { error: GENERIC_ERROR };

  revalidatePath("/plan");
  return { message: "Plan deleted." };
}
