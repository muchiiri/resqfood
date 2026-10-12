import { isCategory, isKind, isUnit, type Category, type FoodItemValues, type Kind, type Unit } from "./items";

export const MAX_NAME_LENGTH = 100;
export const MAX_QUANTITY = 100000;

export type FoodItemField = keyof FoodItemValues;
export type FoodItemFieldErrors = Partial<Record<FoodItemField, string>>;

export type ValidFoodItem = {
  name: string;
  kind: Kind;
  category: Category;
  quantity: number;
  unit: Unit;
  purchasedAt: string;
  expiresAt: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID_PATTERN.test(value);

const DATE_PATTERN =/^(\d{4})-(\d{2})-(\d{2})$/;
const QUANTITY_PATTERN = /^\d+(\.\d{1,2})?$/;

function isRealDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function validateFoodItem(input: FoodItemValues): { fieldErrors: FoodItemFieldErrors; valid?: ValidFoodItem } {
  const fieldErrors: FoodItemFieldErrors = {};
  const name = input.name.trim();
  const quantityText = input.quantity.trim();

  if (!name) fieldErrors.name = "Enter a name.";
  else if (name.length > MAX_NAME_LENGTH) fieldErrors.name = `Use at most ${MAX_NAME_LENGTH} characters.`;

  if (!isKind(input.kind)) fieldErrors.kind = "Choose grocery or leftover.";
  if (!isCategory(input.category)) fieldErrors.category = "Choose a category.";
  if (!isUnit(input.unit)) fieldErrors.unit = "Choose a unit.";

  const quantity = Number(quantityText);
  if (!QUANTITY_PATTERN.test(quantityText) || quantity <= 0 || quantity > MAX_QUANTITY) {
    fieldErrors.quantity = `Enter a number above 0 and up to ${MAX_QUANTITY}, with at most 2 decimals.`;
  }

  if (!isRealDate(input.purchasedAt)) fieldErrors.purchasedAt = "Enter a valid date.";
  if (!isRealDate(input.expiresAt)) fieldErrors.expiresAt = "Enter a valid date.";
  if (!fieldErrors.purchasedAt && !fieldErrors.expiresAt && input.expiresAt < input.purchasedAt) {
    fieldErrors.expiresAt = "The expiry date cannot be before the purchase date.";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
  return {
    fieldErrors,
    valid: {
      name,
      kind: input.kind as Kind,
      category: input.category as Category,
      quantity,
      unit: input.unit as Unit,
      purchasedAt: input.purchasedAt,
      expiresAt: input.expiresAt,
    },
  };
}
