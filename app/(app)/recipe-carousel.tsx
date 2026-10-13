"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RecipeCard } from "@/app/components/recipe-card";
import type { RecipeMatch } from "@/lib/recipes/types";

const EDGE = 4;
const GAP = 12;

export function RecipeCarousel({ heading, matches }: { heading: string; matches: RecipeMatch[] }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const measure = () => setOverflowing(element.scrollWidth > element.clientWidth + EDGE);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [matches.length]);

  // Moves one card at a time and wraps around at either end, so the row loops through every suggestion.
  const move = useCallback((direction: 1 | -1) => {
    const element = scroller.current;
    const first = element?.firstElementChild as HTMLElement | null;
    if (!element || !first) return;

    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - EDGE;
    const atStart = element.scrollLeft <= EDGE;

    if (direction === 1 && atEnd) element.scrollTo({ left: 0, behavior });
    else if (direction === -1 && atStart) element.scrollTo({ left: element.scrollWidth, behavior });
    else element.scrollBy({ left: direction * (first.offsetWidth + GAP), behavior });
  }, []);

  const buttonClass =
    "grid size-9 place-items-center rounded-full border bg-card outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <section aria-labelledby="recipe-ideas-title" className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 id="recipe-ideas-title" className="text-lg font-bold">
          {heading}
        </h2>
        {overflowing && (
          <div className="flex gap-2">
            <button type="button" onClick={() => move(-1)} aria-label="Previous recipes" className={buttonClass}>
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Next recipes" className={buttonClass}>
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <ul
        ref={scroller}
        aria-label="Recipe ideas"
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {matches.map((match) => (
          <li key={match.recipe.id} className="shrink-0 snap-start">
            <RecipeCard match={match} />
          </li>
        ))}
      </ul>
    </section>
  );
}
