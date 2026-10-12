"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { FoodItemValues } from "@/lib/pantry/items";
import { isUuid, validateFoodItem, type FoodItemFieldErrors } from "@/lib/pantry/validation";

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
