"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { isUuid } from "@/lib/pantry/validation";
import { createClient } from "@/lib/supabase/server";
import {
  validateWasteEntry,
  type WasteEntryFieldErrors,
  type WasteEntryValues,
} from "@/lib/waste/validation";

export type AddEntryState = {
  values: WasteEntryValues;
  error?: string;
  fieldErrors?: WasteEntryFieldErrors;
  message?: string;
};
export type DeleteEntryState = { error?: string; message?: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export async function addWasteEntry(_prev: AddEntryState, formData: FormData): Promise<AddEntryState> {
  const values: WasteEntryValues = {
    name: text(formData, "name"),
    outcome: text(formData, "outcome"),
    quantity: text(formData, "quantity"),
    unit: text(formData, "unit"),
    weightKg: text(formData, "weightKg"),
    estimatedValue: text(formData, "estimatedValue"),
  };

  const user = await getCurrentUser();
  if (!user) return { values, error: "Please log in again." };

  const { fieldErrors, valid } = validateWasteEntry(values);
  if (!valid) return { values, fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("waste_log_entries").insert({
    user_id: user.id,
    name: valid.name,
    outcome: valid.outcome,
    quantity: valid.quantity,
    unit: valid.unit,
    weight_kg: valid.weightKg,
    estimated_value: valid.estimatedValue,
  });
  if (error) return { values, error: GENERIC_ERROR };

  revalidatePath("/waste-log");
  return { values: { name: "", outcome: "", quantity: "", unit: "", weightKg: "", estimatedValue: "" }, message: "Entry added." };
}

export async function deleteWasteEntry(id: string): Promise<DeleteEntryState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (typeof id !== "string" || !isUuid(id)) return { error: GENERIC_ERROR };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("waste_log_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (error || !data || data.length !== 1) return { error: GENERIC_ERROR };

  revalidatePath("/waste-log");
  return { message: "Entry deleted." };
}
