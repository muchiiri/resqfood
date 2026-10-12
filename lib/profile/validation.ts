import { isFoodPreference, type FoodPreference } from "./preferences";

export const MAX_NAME_LENGTH = 80;
export const MAX_LOCATION_LENGTH = 120;
export const MIN_HOUSEHOLD_SIZE = 1;
export const MAX_HOUSEHOLD_SIZE = 20;

export type ProfileField = "name" | "location" | "householdSize" | "foodPreferences";
export type ProfileFieldErrors = Partial<Record<ProfileField, string>>;

export type ProfileInput = {
  name: string;
  location: string;
  householdSize: string;
  foodPreferences: string[];
};

export type ValidProfile = {
  name: string | null;
  location: string | null;
  householdSize: number | null;
  foodPreferences: FoodPreference[];
};

export function validateProfile(input: ProfileInput): { fieldErrors: ProfileFieldErrors; valid?: ValidProfile } {
  const fieldErrors: ProfileFieldErrors = {};
  const name = input.name.trim();
  const location = input.location.trim();
  const size = input.householdSize.trim();

  if (name.length > MAX_NAME_LENGTH) fieldErrors.name = `Use at most ${MAX_NAME_LENGTH} characters.`;
  if (location.length > MAX_LOCATION_LENGTH) fieldErrors.location = `Use at most ${MAX_LOCATION_LENGTH} characters.`;

  let householdSize: number | null = null;
  if (size !== "") {
    householdSize = Number(size);
    if (!Number.isInteger(householdSize) || householdSize < MIN_HOUSEHOLD_SIZE || householdSize > MAX_HOUSEHOLD_SIZE) {
      fieldErrors.householdSize = `Enter a whole number from ${MIN_HOUSEHOLD_SIZE} to ${MAX_HOUSEHOLD_SIZE}.`;
    }
  }

  if (!input.foodPreferences.every(isFoodPreference)) fieldErrors.foodPreferences = "Choose only from the listed options.";

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
  return {
    fieldErrors,
    valid: {
      name: name || null,
      location: location || null,
      householdSize,
      foodPreferences: [...new Set(input.foodPreferences as FoodPreference[])],
    },
  };
}
