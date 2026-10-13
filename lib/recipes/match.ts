import { getExpiryStatus } from "@/lib/pantry/expiry";
import type { Category } from "@/lib/pantry/items";
import type { FoodPreference } from "@/lib/profile/preferences";
import type { Recipe, RecipeMatch } from "./types";

const MAX_ITEM_NAMES = 3;

type ExpiringCandidate = { name: string; category: Category; expiresAt: string };

// Recipes that use the categories of items expiring today or within the soon window,
// limited to those that satisfy every food preference. Pure: no I/O and no clock.
export function matchRecipes({
  items,
  recipes,
  preferences,
  today,
  limit,
}: {
  items: ExpiringCandidate[];
  recipes: Recipe[];
  preferences: FoodPreference[];
  today: string;
  limit: number;
}): RecipeMatch[] {
  const expiring = items
    .filter((item) => {
      const { status } = getExpiryStatus(item.expiresAt, today);
      return status === "today" || status === "soon";
    })
    .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt) || a.name.localeCompare(b.name));

  const scored = recipes
    .filter((recipe) => preferences.every((preference) => recipe.diets.includes(preference)))
    .map((recipe) => {
      const matched = expiring.filter((item) => recipe.categories.includes(item.category));
      const matchedCategories = new Set(matched.map((item) => item.category));
      return { recipe, matched, categoryScore: matchedCategories.size };
    })
    .filter((entry) => entry.categoryScore > 0)
    .sort(
      (a, b) =>
        b.categoryScore - a.categoryScore ||
        b.matched.length - a.matched.length ||
        a.recipe.title.localeCompare(b.recipe.title),
    );

  return scored.slice(0, limit).map(({ recipe, matched }) => ({
    recipe,
    matchedItems: matched.slice(0, MAX_ITEM_NAMES).map((item) => item.name),
  }));
}
