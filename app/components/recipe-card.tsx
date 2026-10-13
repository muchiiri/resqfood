import Link from "next/link";
import { Clock, CookingPot } from "lucide-react";
import type { RecipeMatch } from "@/lib/recipes/types";

export function RecipeCard({ match }: { match: RecipeMatch }) {
  const { recipe, matchedItems } = match;
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="flex h-full w-44 flex-col overflow-hidden rounded-2xl bg-card shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="grid h-12 place-items-center bg-primary-tint text-primary" aria-hidden="true">
        <CookingPot className="size-6" />
      </span>
      <span className="flex flex-1 flex-col gap-0.5 p-3">
        <span className="line-clamp-2 text-sm font-bold leading-snug">{recipe.title}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" aria-hidden="true" />
          {recipe.minutes} min
        </span>
        <span className="line-clamp-2 text-xs text-muted-foreground">Uses {matchedItems.join(", ")}</span>
      </span>
    </Link>
  );
}
