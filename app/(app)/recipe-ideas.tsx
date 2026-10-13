import { connection } from "next/server";
import { getProfile } from "@/lib/auth/session";
import { todayInDubai } from "@/lib/pantry/expiry";
import { listExpiringItems } from "@/lib/pantry/queries";
import { matchRecipes } from "@/lib/recipes/match";
import { listRecipes } from "@/lib/recipes/queries";
import { RecipeCarousel } from "./recipe-carousel";

const HEADING = "Use it before it expires";
const CAROUSEL_LIMIT = 12;

function EmptyMessage({ children }: { children: string }) {
  return (
    <section aria-labelledby="recipe-ideas-title" className="mt-6">
      <h2 id="recipe-ideas-title" className="mb-2 text-lg font-bold">
        {HEADING}
      </h2>
      <p className="max-w-2xl rounded-2xl border border-dashed bg-card p-4 text-sm text-muted-foreground">{children}</p>
    </section>
  );
}

export async function RecipeIdeas() {
  // connection() keeps the clock read out of prerendering and prefetching (Cache Components).
  const [profile, recipes] = await Promise.all([getProfile(), listRecipes()]);
  await connection();
  const today = todayInDubai();
  const items = await listExpiringItems(today);

  const matches = matchRecipes({
    items,
    recipes,
    preferences: profile?.foodPreferences ?? [],
    today,
    limit: CAROUSEL_LIMIT,
  });

  if (items.length === 0) {
    return <EmptyMessage>Nothing is about to expire. Recipe ideas show up here when something is.</EmptyMessage>;
  }
  if (matches.length === 0) {
    return <EmptyMessage>No recipes match your expiring items and food preferences yet.</EmptyMessage>;
  }
  return <RecipeCarousel heading={HEADING} matches={matches} />;
}
