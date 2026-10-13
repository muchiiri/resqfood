import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isFoodPreference } from "@/lib/profile/preferences";
import { isHungerLevel, planPortions, type HungerLevel, type PortionPlan } from "./plan";
import type { FoodPreference } from "@/lib/profile/preferences";

export type SavedPlan = {
  id: string;
  people: number;
  hunger: HungerLevel;
  preferences: FoodPreference[];
  plan: PortionPlan;
  createdAt: string;
};

type Row = {
  id: string;
  people: number;
  hunger_level: string;
  preferences: string[];
  suggestion: unknown;
  created_at: string;
};

const RECENT_LIMIT = 10;

// The stored suggestion is history. If it does not have the expected shape, rebuild it from the inputs.
function isPlan(value: unknown): value is PortionPlan {
  const plan = value as PortionPlan | null;
  return (
    typeof plan === "object" &&
    plan !== null &&
    typeof plan.totalGrams === "number" &&
    Array.isArray(plan.components) &&
    plan.components.every((c) => typeof c.grams === "number" && typeof c.suggestion === "string") &&
    Array.isArray(plan.notes) &&
    plan.notes.every((n) => typeof n === "string")
  );
}

export async function listRecentPlans(): Promise<SavedPlan[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portion_plans")
    .select("id, people, hunger_level, preferences, suggestion, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT);
  if (error) throw new Error("Could not load your plans");

  return (data as Row[]).flatMap((row) => {
    if (!isHungerLevel(row.hunger_level)) return [];
    const preferences = row.preferences.filter(isFoodPreference);
    const plan = isPlan(row.suggestion)
      ? row.suggestion
      : planPortions({ people: row.people, hunger: row.hunger_level, preferences });
    return [{ id: row.id, people: row.people, hunger: row.hunger_level, preferences, plan, createdAt: row.created_at }];
  });
}
