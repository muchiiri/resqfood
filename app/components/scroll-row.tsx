"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const EDGE = 4;
const GAP = 12;

// A row of items that scrolls sideways with snapping and the next item peeking in. With a heading it also shows
// previous and next buttons, but only when the row actually overflows. Items are plain nodes: wrap each card in one link.
export function ScrollRow({
  id,
  label,
  heading,
  items,
}: {
  id: string;
  label: string;
  heading?: string;
  items: ReactNode[];
}) {
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
  }, [items.length]);

  // Moves one item at a time and wraps at either end, like the recipe carousel.
  const move = useCallback((direction: 1 | -1) => {
    const element = scroller.current;
    const first = element?.firstElementChild as HTMLElement | null;
    if (!element || !first) return;

    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth";
    const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - EDGE;
    const atStart = element.scrollLeft <= EDGE;

    if (direction === 1 && atEnd) element.scrollTo({ left: 0, behavior });
    else if (direction === -1 && atStart) element.scrollTo({ left: element.scrollWidth, behavior });
    else element.scrollBy({ left: direction * (first.offsetWidth + GAP), behavior });
  }, []);

  const buttonClass =
    "grid size-9 place-items-center rounded-full border bg-card outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <section
      aria-label={heading ? undefined : label}
      aria-labelledby={heading ? `${id}-title` : undefined}
      className="flex flex-col gap-3"
    >
      {heading && (
        <div className="flex items-center justify-between gap-3">
          <h2 id={`${id}-title`} className="text-xl font-extrabold">
            {heading}
          </h2>
          {overflowing && (
            <div className="flex gap-2">
              <button type="button" onClick={() => move(-1)} aria-label={`Previous ${label}`} className={buttonClass}>
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => move(1)} aria-label={`Next ${label}`} className={buttonClass}>
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
      <ul
        ref={scroller}
        aria-label={label}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4 pb-1 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <li key={index} className="shrink-0 snap-start">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
