import type { Unit } from "./items";

export const OUTCOMES = ["eaten", "shared", "thrown_away"] as const;
export type Outcome = (typeof OUTCOMES)[number];

export const OUTCOME_LABELS: Record<Outcome, string> = {
  eaten: "Eaten",
  shared: "Shared",
  thrown_away: "Thrown away",
};

export const isOutcome = (v: unknown): v is Outcome =>
  typeof v === "string" && (OUTCOMES as readonly string[]).includes(v);

export type OutcomeRecord = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  outcome: Outcome;
  outcomeAt: string;
};

// What the outcome form holds: every field as the user typed it.
export type OutcomeValues = { outcome: string; quantity: string; weightKg: string; estimatedValue: string };
