import { Suspense } from "react";
import { RecipeIdeas } from "./recipe-ideas";

function RecipeSkeleton() {
  return (
    <div className="mt-6 flex gap-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 w-44 shrink-0 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-tight">Home</h1>
      <Suspense fallback={<RecipeSkeleton />}>
        <RecipeIdeas />
      </Suspense>
    </main>
  );
}
