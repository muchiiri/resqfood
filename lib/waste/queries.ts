import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { isUnit } from "@/lib/pantry/items";
import { isOutcome } from "@/lib/pantry/outcomes";
import { createClient } from "@/lib/supabase/server";
import type { WasteEntry } from "./types";

const LOG_LIMIT = 50;

type Row = {
  id: string;
  food_item_id: string | null;
  name: string;
  outcome: string;
  quantity: number | string;
  unit: string;
  weight_kg: number | string | null;
  estimated_value: number | string | null;
  logged_at: string;
};

// Row level security limits this to the viewer's own entries; the filter is for clarity.
export async function listWasteLog(): Promise<WasteEntry[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("waste_log_entries")
    .select("id, food_item_id, name, outcome, quantity, unit, weight_kg, estimated_value, logged_at")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(LOG_LIMIT);
  if (error) throw new Error("Could not load your waste log");

  return (data as Row[]).map((row) => {
    if (!isOutcome(row.outcome) || !isUnit(row.unit)) throw new Error("Waste log row has an unexpected value");
    return {
      id: row.id,
      name: row.name,
      outcome: row.outcome,
      quantity: Number(row.quantity),
      unit: row.unit,
      weightKg: row.weight_kg == null ? null : Number(row.weight_kg),
      estimatedValue: row.estimated_value == null ? null : Number(row.estimated_value),
      loggedAt: row.logged_at,
      manual: row.food_item_id === null,
    };
  });
}
