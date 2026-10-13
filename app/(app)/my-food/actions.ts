"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { FoodItemValues } from "@/lib/pantry/items";
import type { OutcomeValues } from "@/lib/pantry/outcomes";
import { defaultWeightKg, validateExtras } from "@/lib/waste/validation";
import { getFoodItem } from "@/lib/pantry/queries";
import {
  isUuid,
  validateFoodItem,
  validateOutcome,
  type FoodItemFieldErrors,
  type OutcomeFieldErrors,
} from "@/lib/pantry/validation";

export type FoodItemState = { values: FoodItemValues; error?: string; fieldErrors?: FoodItemFieldErrors };
export type DeleteState = { error?: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

function readValues(formData: FormData): FoodItemValues {
  return {
    name: text(formData, "name"),
    kind: text(formData, "kind"),
    category: text(formData, "category"),
    quantity: text(formData, "quantity"),
    unit: text(formData, "unit"),
    purchasedAt: text(formData, "purchasedAt"),
    expiresAt: text(formData, "expiresAt"),
  };
}

function toRow(valid: NonNullable<ReturnType<typeof validateFoodItem>["valid"]>) {
  return {
    name: valid.name,
    kind: valid.kind,
    category: valid.category,
    quantity: valid.quantity,
    unit: valid.unit,
    purchased_at: valid.purchasedAt,
    expires_at: valid.expiresAt,
  };
}

export async function createFoodItem(_prev: FoodItemState, formData: FormData): Promise<FoodItemState> {
  const values = readValues(formData);
  const user = await getCurrentUser();
  if (!user) return { values, error: "Please log in again." };

  const { fieldErrors, valid } = validateFoodItem(values);
  if (!valid) return { values, fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_items")
    .insert({ ...toRow(valid), owner_id: user.id })
    .select("id");
  if (error || !data || data.length !== 1) return { values, error: GENERIC_ERROR };

  revalidatePath("/my-food");
  redirect("/my-food");
}

export async function updateFoodItem(id: string, _prev: FoodItemState, formData: FormData): Promise<FoodItemState> {
  const values = readValues(formData);
  const user = await getCurrentUser();
  if (!user) return { values, error: "Please log in again." };
  if (!isUuid(id)) return { values, error: GENERIC_ERROR };

  const { fieldErrors, valid } = validateFoodItem(values);
  if (!valid) return { values, fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_items")
    .update(toRow(valid))
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");
  if (error || !data || data.length !== 1) return { values, error: GENERIC_ERROR };

  revalidatePath("/my-food");
  redirect("/my-food");
}

export async function deleteFoodItem(id: string): Promise<DeleteState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (!isUuid(id)) return { error: GENERIC_ERROR };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_items")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");
  if (error || !data || data.length !== 1) return { error: GENERIC_ERROR };

  revalidatePath("/my-food");
  redirect("/my-food");
}

export type OutcomeState = { values: OutcomeValues; error?: string; fieldErrors?: OutcomeFieldErrors };
export type RestoreState = { error?: string };

export async function recordOutcome(id: string, _prev: OutcomeState, formData: FormData): Promise<OutcomeState> {
  const values: OutcomeValues = {
    outcome: text(formData, "outcome"),
    quantity: text(formData, "quantity"),
    weightKg: text(formData, "weightKg"),
    estimatedValue: text(formData, "estimatedValue"),
  };
  const user = await getCurrentUser();
  if (!user) return { values, error: "Please log in again." };
  if (!isUuid(id)) return { values, error: GENERIC_ERROR };

  const item = await getFoodItem(id);
  if (!item) return { values, error: GENERIC_ERROR };

  const { fieldErrors, valid } = validateOutcome(values, item.quantity);
  const extras = validateExtras(values);
  if (!valid || !extras.valid) return { values, fieldErrors: { ...fieldErrors, ...extras.fieldErrors } };

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_food_outcome", {
    p_item_id: id,
    p_outcome: valid.outcome,
    p_quantity: valid.quantity,
    p_weight_kg: extras.valid.weightKg ?? defaultWeightKg(valid.quantity, item.unit),
    p_estimated_value: extras.valid.estimatedValue,
  });
  if (error) return { values, error: GENERIC_ERROR };

  revalidatePath("/my-food");
  redirect("/my-food");
}

export async function restoreOutcome(id: string): Promise<RestoreState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (!isUuid(id)) return { error: GENERIC_ERROR };

  const supabase = await createClient();
  const { error } = await supabase.rpc("restore_food_outcome", { p_item_id: id });
  if (error) return { error: GENERIC_ERROR };

  revalidatePath("/my-food");
  redirect("/my-food");
}
