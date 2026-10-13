import { isUnit, UNITS, type Unit } from "@/lib/pantry/items";
import { isOutcome, type Outcome } from "@/lib/pantry/outcomes";

export const MAX_NAME_LENGTH = 100;
export const MAX_QUANTITY = 100000;
export const MAX_WEIGHT_KG = 100000;
export const MAX_VALUE = 1000000;

const QUANTITY_PATTERN = /^\d+(\.\d{1,2})?$/;
const WEIGHT_PATTERN = /^\d+(\.\d{1,3})?$/;
const VALUE_PATTERN = /^\d+(\.\d{1,2})?$/;

// kg and g convert exactly. Every other unit (pieces, packs, litres) has no honest weight, so it stays empty.
export function defaultWeightKg(quantity: number, unit: Unit): number | null {
  if (unit === "kg") return quantity;
  if (unit === "g") {
    const kg = Math.round(quantity) / 1000;
    return kg > 0 ? kg : null;
  }
  return null;
}

export type ExtrasValues = { weightKg: string; estimatedValue: string };
export type ExtrasFieldErrors = Partial<Record<keyof ExtrasValues, string>>;

// Optional weight and value. Empty means "not provided", never 0.
export function validateExtras(values: ExtrasValues): {
  fieldErrors: ExtrasFieldErrors;
  valid: { weightKg: number | null; estimatedValue: number | null } | null;
} {
  const fieldErrors: ExtrasFieldErrors = {};
  const weightText = values.weightKg.trim();
  const valueText = values.estimatedValue.trim();
  let weightKg: number | null = null;
  let estimatedValue: number | null = null;

  if (weightText !== "") {
    weightKg = Number(weightText);
    if (!WEIGHT_PATTERN.test(weightText) || !(weightKg > 0) || weightKg > MAX_WEIGHT_KG) {
      fieldErrors.weightKg = "Enter a weight above 0, with at most 3 decimals.";
    }
  }
  if (valueText !== "") {
    estimatedValue = Number(valueText);
    if (!VALUE_PATTERN.test(valueText) || estimatedValue > MAX_VALUE) {
      fieldErrors.estimatedValue = "Enter an amount of 0 or more, with at most 2 decimals.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, valid: null };
  return { fieldErrors, valid: { weightKg, estimatedValue } };
}

export type WasteEntryValues = {
  name: string;
  outcome: string;
  quantity: string;
  unit: string;
  weightKg: string;
  estimatedValue: string;
};
export type WasteEntryFieldErrors = Partial<Record<keyof WasteEntryValues, string>>;
export type ValidWasteEntry = {
  name: string;
  outcome: Outcome;
  quantity: number;
  unit: Unit;
  weightKg: number | null;
  estimatedValue: number | null;
};

export const emptyWasteEntryValues = (): WasteEntryValues => ({
  name: "",
  outcome: "",
  quantity: "",
  unit: "",
  weightKg: "",
  estimatedValue: "",
});

export function validateWasteEntry(values: WasteEntryValues): {
  fieldErrors: WasteEntryFieldErrors;
  valid: ValidWasteEntry | null;
} {
  const fieldErrors: WasteEntryFieldErrors = {};

  const name = values.name.trim();
  if (name === "") fieldErrors.name = "Enter what the food was.";
  else if (name.length > MAX_NAME_LENGTH) fieldErrors.name = `Use at most ${MAX_NAME_LENGTH} characters.`;

  if (!isOutcome(values.outcome)) fieldErrors.outcome = "Choose eaten, shared or thrown away.";

  const quantityText = values.quantity.trim();
  const quantity = Number(quantityText);
  if (!QUANTITY_PATTERN.test(quantityText) || !(quantity > 0) || quantity > MAX_QUANTITY) {
    fieldErrors.quantity = "Enter a number above 0, with at most 2 decimals.";
  }

  if (!isUnit(values.unit)) fieldErrors.unit = `Choose a unit (${UNITS.join(", ")}).`;

  const extras = validateExtras(values);
  Object.assign(fieldErrors, extras.fieldErrors);

  if (Object.keys(fieldErrors).length > 0 || !extras.valid) return { fieldErrors, valid: null };

  const unit = values.unit as Unit;
  return {
    fieldErrors,
    valid: {
      name,
      outcome: values.outcome as Outcome,
      quantity,
      unit,
      weightKg: extras.valid.weightKg ?? defaultWeightKg(quantity, unit),
      estimatedValue: extras.valid.estimatedValue,
    },
  };
}
