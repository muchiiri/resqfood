"use client";

import { ChevronUp } from "lucide-react";
import { formatCountdown, useNow, type Pickup } from "./pickup";

export function PickupBar({ pickup, onOpen }: { pickup: Pickup | null; onOpen: () => void }) {
  const now = useNow();
  if (!pickup) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Active pickup: ${pickup.title} at ${pickup.place}. Open details`}
      className="fixed inset-x-2 bottom-[76px] z-30 flex min-h-12 items-center gap-3 rounded-2xl bg-primary px-3 py-2 text-left text-primary-foreground shadow-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:inset-x-0 md:bottom-0 md:h-16 md:rounded-none md:px-6"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-lg" aria-hidden="true">
        🥙
      </span>
      <span className="min-w-0 flex-1">
        <b className="block truncate text-sm">{pickup.title}</b>
        <small className="block truncate text-xs opacity-85">{pickup.place}</small>
      </span>
      <span className="text-sm font-extrabold text-amber" aria-hidden="true">
        {formatCountdown(pickup.deadline, now)}
      </span>
      <ChevronUp className="size-5 lg:hidden" aria-hidden="true" />
    </button>
  );
}
