import { useSyncExternalStore } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const QUERIES = ["(min-width: 768px)", "(min-width: 1024px)"];

function subscribe(onChange: () => void) {
  const lists = QUERIES.map((q) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener("change", onChange));
  return () => lists.forEach((l) => l.removeEventListener("change", onChange));
}

function snapshot(): Breakpoint {
  if (window.matchMedia(QUERIES[1]).matches) return "desktop";
  if (window.matchMedia(QUERIES[0]).matches) return "tablet";
  return "mobile";
}

// Only picks which overlay opens; the layout itself switches with CSS breakpoints.
export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, snapshot, () => "mobile");
}
