import type { FoodPreference } from "@/lib/profile/preferences";

export const HUNGER_LEVELS = ["light", "normal", "very_hungry"] as const;
export type HungerLevel = (typeof HUNGER_LEVELS)[number];
export const HUNGER_LABELS: Record<HungerLevel, string> = {
  light: "Light",
  normal: "Normal",
  very_hungry: "Very hungry",
};
export const isHungerLevel = (v: unknown): v is HungerLevel =>
  typeof v === "string" && (HUNGER_LEVELS as readonly string[]).includes(v);

export const MIN_PEOPLE = 1;
export const MAX_PEOPLE = 50;

// Cooked grams per person for one main meal at normal hunger. General rules of thumb, not nutrition advice.
const BASE_GRAMS = { protein: 120, carbs: 180, vegetables: 150 } as const;
const HUNGER_MULTIPLIER: Record<HungerLevel, number> = { light: 0.75, normal: 1, very_hungry: 1.3 };

export type ComponentKey = keyof typeof BASE_GRAMS;
export const COMPONENT_LABELS: Record<ComponentKey, string> = {
  protein: "Protein",
  carbs: "Carbs",
  vegetables: "Vegetables",
};

export type PortionInput = { people: number; hunger: HungerLevel; preferences: readonly FoodPreference[] };
export type PortionPlan = {
  totalGrams: number;
  components: { key: ComponentKey; grams: number; suggestion: string }[];
  notes: string[];
};

const roundToTen = (grams: number) => Math.round(grams / 10) * 10;

function proteinSuggestion(has: (p: FoodPreference) => boolean): string {
  if (has("vegan")) return "Legumes, tofu or tempeh";
  if (has("vegetarian")) return has("dairy_free") ? "Eggs, legumes or tofu" : "Eggs, dairy, legumes or tofu";
  return has("dairy_free") ? "Meat, fish, eggs or legumes (no dairy)" : "Meat, fish, eggs or legumes";
}

export function planPortions({ people, hunger, preferences }: PortionInput): PortionPlan {
  const has = (p: FoodPreference) => preferences.includes(p);
  const suggestions: Record<ComponentKey, string> = {
    protein: proteinSuggestion(has),
    carbs: has("gluten_free") ? "Rice, potatoes, corn or quinoa" : "Rice, pasta, bread or potatoes",
    vegetables: "Any mix of cooked or fresh vegetables",
  };

  const components = (Object.keys(BASE_GRAMS) as ComponentKey[]).map((key) => ({
    key,
    grams: roundToTen(BASE_GRAMS[key] * people * HUNGER_MULTIPLIER[hunger]),
    suggestion: suggestions[key],
  }));

  const notes: string[] = [];
  if (has("halal")) notes.push("Use halal-certified meat and check sauces.");
  if (has("dairy_free")) notes.push("Skip dairy in sauces, dressings and sides.");
  if (has("gluten_free")) notes.push("Avoid wheat, and check sauces and stock for gluten.");
  if (has("nut_allergy")) notes.push("Check labels and avoid nut-based sauces and oils.");

  return { totalGrams: components.reduce((sum, c) => sum + c.grams, 0), components, notes };
}
