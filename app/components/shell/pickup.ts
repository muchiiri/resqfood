import { useSyncExternalStore } from "react";

export type Pickup = { title: string; place: string; deadline: Date };

const noopSubscribe = () => () => {};

// Placeholder until feature 14 (Claim & pickup) supplies real claims. Created on
// the client only, because cache components forbid reading the clock while prerendering.
let placeholder: Pickup | null = null;
export function usePlaceholderPickup(): Pickup | null {
  return useSyncExternalStore(
    noopSubscribe,
    () =>
      (placeholder ??= {
        title: "Chicken shawarma x4",
        place: "Al Noor Grill",
        deadline: new Date(Date.now() + 90 * 60_000),
      }),
    () => null,
  );
}

let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribeNow(listener: () => void) {
  if (listeners.size === 0) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) clearInterval(timer);
  };
}

export function useNow(): number | null {
  const value = useSyncExternalStore(subscribeNow, () => now, () => 0);
  return value === 0 ? null : value;
}

export function formatCountdown(deadline: Date, nowMs: number | null): string {
  if (nowMs === null) return "--:--";
  const total = Math.max(0, Math.floor((deadline.getTime() - nowMs) / 1000));
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}
