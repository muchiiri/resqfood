"use client";

import { useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HUNGER_LABELS, type HungerLevel, type PortionPlan } from "@/lib/portions/plan";
import { FOOD_PREFERENCE_LABELS, type FoodPreference } from "@/lib/profile/preferences";
import { deletePlan } from "./actions";
import { PlanResult } from "./plan-result";

export type SavedPlanView = {
  id: string;
  people: number;
  hunger: HungerLevel;
  preferences: FoodPreference[];
  plan: PortionPlan;
  savedAt: string;
};

export function SavedPlans({ plans }: { plans: SavedPlanView[] }) {
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string>();
  const [, startTransition] = useTransition();
  const heading = useRef<HTMLHeadingElement>(null);

  function remove(id: string) {
    setBusy(id);
    setError(undefined);
    startTransition(async () => {
      const result = await deletePlan(id);
      setBusy(undefined);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "");
      // The deleted row is gone, so move focus to the list heading.
      heading.current?.focus();
    });
  }

  return (
    <section aria-labelledby="recent-plans-title" className="flex max-w-4xl flex-col gap-3">
      <h2 id="recent-plans-title" ref={heading} tabIndex={-1} className="text-xl font-extrabold outline-none">
        Recent plans
      </h2>
      <p role="status" className="sr-only">
        {message}
      </p>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      {plans.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved plans yet.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {plans.map((saved) => {
            const who = `${saved.people} ${saved.people === 1 ? "person" : "people"}`;
            return (
              <li key={saved.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">
                      {who}, {HUNGER_LABELS[saved.hunger].toLowerCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {saved.preferences.length > 0
                        ? saved.preferences.map((p) => FOOD_PREFERENCE_LABELS[p]).join(", ")
                        : "No preferences"}
                      {" · "}
                      {saved.savedAt}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => remove(saved.id)}
                    disabled={busy === saved.id}
                    aria-label={`Delete plan for ${who}, ${saved.savedAt}`}
                    className="h-10 shrink-0 rounded-full px-4"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    {busy === saved.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
                <PlanResult plan={saved.plan} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
