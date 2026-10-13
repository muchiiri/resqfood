import type { Category } from "@/lib/pantry/items";
import type { FoodPreference } from "@/lib/profile/preferences";

export type Recipe = {
  id: string;
  title: string;
  description: string;
  minutes: number;
  ingredients: string[];
  steps: string[];
  categories: Category[];
  diets: FoodPreference[];
};

export type RecipeMatch = { recipe: Recipe; matchedItems: string[] };
