import "server-only";
import { isCategory } from "@/lib/pantry/items";
import { isUuid } from "@/lib/pantry/validation";
import { isFoodPreference } from "@/lib/profile/preferences";
import { createClient } from "@/lib/supabase/server";
import type { Recipe } from "./types";

const COLUMNS = "id, title, description, minutes, ingredients, steps, categories, diets";

type Row = {
  id: string;
  title: string;
  description: string;
  minutes: number;
  ingredients: string[];
  steps: string[];
  categories: string[];
  diets: string[];
};

const toRecipe = (row: Row): Recipe => ({
  ...row,
  categories: row.categories.filter(isCategory),
  diets: row.diets.filter(isFoodPreference),
});

export async function listRecipes(): Promise<Recipe[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("recipes").select(COLUMNS).order("title");
  if (error) throw new Error("Could not load recipes");
  return (data as Row[]).map(toRecipe);
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("recipes").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error("Could not load recipe");
  return data ? toRecipe(data as Row) : null;
}
