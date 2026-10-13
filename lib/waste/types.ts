import type { Unit } from "@/lib/pantry/items";
import type { Outcome } from "@/lib/pantry/outcomes";

export type WasteEntry = {
  id: string;
  name: string;
  outcome: Outcome;
  quantity: number;
  unit: Unit;
  weightKg: number | null;
  estimatedValue: number | null;
  loggedAt: string;
  // Entries made from a pantry outcome are removed by restoring that outcome, not deleted here.
  manual: boolean;
};
