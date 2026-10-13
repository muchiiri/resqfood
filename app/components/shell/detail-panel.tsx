"use client";

import { PickupDetails } from "./pickup-details";
import type { Pickup } from "./pickup";

export function DetailPanel({ pickups }: { pickups: Pickup[] }) {
  return (
    <aside
      aria-label="Details"
      className="fixed bottom-16 right-0 top-16 z-10 hidden w-80 overflow-y-auto border-l bg-card p-4 lg:block"
    >
      <h2 className="mb-3 text-sm font-bold text-muted-foreground">Active pickups</h2>
      {pickups.length > 0 ? (
        <PickupDetails pickups={pickups} />
      ) : (
        <p className="text-sm text-muted-foreground">No active pickups.</p>
      )}
      <h2 className="mb-2 mt-8 text-sm font-bold text-muted-foreground">Expiring items</h2>
      <p className="text-sm text-muted-foreground">Nothing is expiring yet.</p>
    </aside>
  );
}
