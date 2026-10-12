"use client";

import { Clock, MapPin } from "lucide-react";
import { formatCountdown, useNow, type Pickup } from "./pickup";

export function PickupDetails({ pickup }: { pickup: Pickup }) {
  const now = useNow();
  return (
    <div className="flex flex-col gap-4">
      <div className="grid h-40 place-items-center rounded-2xl bg-today-tint text-6xl" aria-hidden="true">
        🥙
      </div>
      <h3 className="text-xl font-extrabold tracking-tight">{pickup.title}</h3>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4" aria-hidden="true" /> {pickup.place}
      </p>
      <p className="flex items-center gap-2 text-sm font-semibold text-today">
        <Clock className="size-4" aria-hidden="true" /> Pick up within {formatCountdown(pickup.deadline, now)}
      </p>
    </div>
  );
}
