import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { MonthlyStats, StatsTotals } from "./stats";

type AmountRow = {
  eaten_kg: number | string;
  shared_kg: number | string;
  wasted_kg: number | string;
  eaten_value: number | string;
  shared_value: number | string;
  wasted_value: number | string;
};
type TotalRow = AmountRow & {
  entries: number | string;
  entries_without_weight: number | string;
  entries_without_value: number | string;
};
type MonthRow = AmountRow & { month_start: string };

const amounts = (row: AmountRow) => ({
  eatenKg: Number(row.eaten_kg),
  sharedKg: Number(row.shared_kg),
  wastedKg: Number(row.wasted_kg),
  eatenValue: Number(row.eaten_value),
  sharedValue: Number(row.shared_value),
  wastedValue: Number(row.wasted_value),
});

// Both functions total the signed-in user's own log in the database; nothing here takes an id from the client.
export async function getWasteStats(months: number): Promise<{ totals: StatsTotals; monthly: MonthlyStats[] } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const [totalResult, monthlyResult] = await Promise.all([
    supabase.rpc("waste_stats_total"),
    supabase.rpc("waste_stats_monthly", { p_months: months }),
  ]);
  if (totalResult.error || monthlyResult.error) throw new Error("Could not load your waste stats");

  const total = (totalResult.data as TotalRow[] | null)?.[0];
  if (!total) throw new Error("Could not load your waste stats");

  return {
    totals: {
      ...amounts(total),
      entries: Number(total.entries),
      entriesWithoutWeight: Number(total.entries_without_weight),
      entriesWithoutValue: Number(total.entries_without_value),
    },
    monthly: ((monthlyResult.data as MonthRow[] | null) ?? []).map((row) => ({
      monthStart: row.month_start,
      ...amounts(row),
    })),
  };
}
