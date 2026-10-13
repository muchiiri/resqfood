import { isCategory, isUnit, type Category, type Unit } from "@/lib/pantry/items";
import type { ListingValues } from "./types";

export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_AREA_LENGTH = 80;
export const MAX_DETAILS_LENGTH = 300;
export const MAX_QUANTITY = 100000;
export const MAX_DAYS_AHEAD = 7;
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

const UAE_OFFSET_HOURS = 4;
const QUANTITY_PATTERN = /^\d+(\.\d{1,2})?$/;
const LOCAL_DATETIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export type ListingFieldErrors = Partial<Record<keyof ListingValues, string>>;

export type ValidListing = {
  title: string;
  category: Category;
  quantity: number;
  unit: Unit;
  description: string | null;
  pickupArea: string;
  pickupDetails: string | null;
  availableUntilIso: string;
};

// Reads "YYYY-MM-DDTHH:mm" as UAE time (UTC+4, no daylight saving) and returns the UTC instant in ms.
export function parseUaeDateTime(value: string): number | null {
  const m = LOCAL_DATETIME.exec(value);
  if (!m) return null;
  const [year, month, day, hour, minute] = m.slice(1).map(Number);
  const utc = Date.UTC(year, month - 1, day, hour - UAE_OFFSET_HOURS, minute);
  const check = new Date(utc + UAE_OFFSET_HOURS * 3_600_000);
  const real =
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day &&
    check.getUTCHours() === hour &&
    check.getUTCMinutes() === minute;
  return real ? utc : null;
}

export function validateListing(
  input: ListingValues,
  nowMs: number,
): { fieldErrors: ListingFieldErrors; valid?: ValidListing } {
  const fieldErrors: ListingFieldErrors = {};
  const title = input.title.trim();
  const description = input.description.trim();
  const pickupArea = input.pickupArea.trim();
  const pickupDetails = input.pickupDetails.trim();
  const quantityText = input.quantity.trim();
  const quantity = Number(quantityText);

  if (!title) fieldErrors.title = "Enter a title.";
  else if (title.length > MAX_TITLE_LENGTH) fieldErrors.title = `Use at most ${MAX_TITLE_LENGTH} characters.`;

  if (!isCategory(input.category)) fieldErrors.category = "Choose a category.";

  if (!QUANTITY_PATTERN.test(quantityText) || quantity <= 0 || quantity > MAX_QUANTITY) {
    fieldErrors.quantity = `Enter a number above 0 and up to ${MAX_QUANTITY}, with at most 2 decimals.`;
  }
  if (!isUnit(input.unit)) fieldErrors.unit = "Choose a unit.";

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    fieldErrors.description = `Use at most ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  if (!pickupArea) fieldErrors.pickupArea = "Enter the pickup area.";
  else if (pickupArea.length > MAX_AREA_LENGTH) fieldErrors.pickupArea = `Use at most ${MAX_AREA_LENGTH} characters.`;

  if (pickupDetails.length > MAX_DETAILS_LENGTH) {
    fieldErrors.pickupDetails = `Use at most ${MAX_DETAILS_LENGTH} characters.`;
  }

  const until = parseUaeDateTime(input.availableUntil);
  if (until === null) fieldErrors.availableUntil = "Choose a date and time.";
  else if (until <= nowMs) fieldErrors.availableUntil = "Choose a time in the future.";
  else if (until > nowMs + MAX_DAYS_AHEAD * 86_400_000) {
    fieldErrors.availableUntil = `Choose a time within the next ${MAX_DAYS_AHEAD} days.`;
  }

  if (Object.keys(fieldErrors).length > 0 || until === null) return { fieldErrors };
  return {
    fieldErrors,
    valid: {
      title,
      category: input.category as Category,
      quantity,
      unit: input.unit as Unit,
      description: description || null,
      pickupArea,
      pickupDetails: pickupDetails || null,
      availableUntilIso: new Date(until).toISOString(),
    },
  };
}

// JPEG files start with FF D8 FF.
export function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}
