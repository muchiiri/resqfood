import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ChevronLeft, Clock } from "lucide-react";
import { getProfile } from "@/lib/auth/session";
import { todayInDubai } from "@/lib/pantry/expiry";
import { listExpiringItems } from "@/lib/pantry/queries";
import { matchRecipes } from "@/lib/recipes/match";
import { getRecipe } from "@/lib/recipes/queries";

export const metadata: Metadata = { title: "Recipe | ResQfood" };

async function RecipeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  const profile = await getProfile();
  await connection();
  const today = todayInDubai();
  const items = await listExpiringItems(today);
  const usable = matchRecipes({ items, recipes: [recipe], preferences: [], today, limit: 1 })[0]?.matchedItems ?? [];
  const preferences = profile?.foodPreferences ?? [];
  const meetsPreferences = preferences.every((p) => recipe.diets.includes(p));

  return (
    <article className="flex max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">{recipe.title}</h1>
        <p className="mt-2 text-muted-foreground">{recipe.description}</p>
        <p className="mt-2 flex items-center gap-1 text-sm font-semibold">
          <Clock className="size-4" aria-hidden="true" />
          {recipe.minutes} min
        </p>
      </header>

      {usable.length > 0 && (
        <p className="rounded-xl bg-fresh-tint px-4 py-3 text-sm font-medium text-fresh">
          Uses your expiring items: {usable.join(", ")}.
        </p>
      )}
      {!meetsPreferences && (
        <p role="note" className="rounded-xl bg-expiring-tint px-4 py-3 text-sm font-medium text-expiring">
          This recipe is not marked as suitable for all of your food preferences.
        </p>
      )}

      <section aria-labelledby="ingredients-title">
        <h2 id="ingredients-title" className="mb-2 text-xl font-bold">
          Ingredients
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          {recipe.ingredients.map((ingredient, i) => (
            <li key={i}>{ingredient}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-title">
        <h2 id="steps-title" className="mb-2 text-xl font-bold">
          Steps
        </h2>
        <ol className="list-decimal space-y-2 pl-5">
          {recipe.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <p className="text-sm text-muted-foreground">
        Always check ingredients and labels for allergens and halal sourcing.
      </p>
    </article>
  );
}

export default function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back to Home
      </Link>
      <Suspense fallback={<div className="h-64 max-w-2xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <RecipeDetail params={params} />
      </Suspense>
    </main>
  );
}
