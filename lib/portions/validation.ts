import { FOOD_PREFERENCES, isFoodPreference, type FoodPreference } from "@/lib/profile/preferences";
import { isHungerLevel, MAX_PEOPLE, MIN_PEOPLE, type HungerLevel } from "./plan";

// What the form holds: every field as the user typed it.
export type PortionValues = { people: string; hunger: string; preferences: string[] };
export type PortionFieldErrors = Partial<Record<"people" | "hunger" | "preferences", string>>;
export type ValidPortion = { people: number; hunger: HungerLevel; preferences: FoodPreference[] };

export function validatePortion(values: PortionValues): { fieldErrors: PortionFieldErrors; valid: ValidPortion | null } {
  const fieldErrors: PortionFieldErrors = {};

  const people = /^\d{1,3}$/.test(values.people.trim()) ? Number(values.people.trim()) : NaN;
  if (!(people >= MIN_PEOPLE && people <= MAX_PEOPLE)) {
    fieldErrors.people = `Enter a whole number from ${MIN_PEOPLE} to ${MAX_PEOPLE}.`;
  }

  if (!isHungerLevel(values.hunger)) fieldErrors.hunger = "Choose a hunger level.";

  const preferences = values.preferences;
  const known = preferences.every(isFoodPreference);
  if (!known || new Set(preferences).size !== preferences.length || preferences.length > FOOD_PREFERENCES.length) {
    fieldErrors.preferences = "Choose from the listed preferences.";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, valid: null };
  return {
    fieldErrors,
    valid: { people, hunger: values.hunger as HungerLevel, preferences: preferences as FoodPreference[] },
  };
}
