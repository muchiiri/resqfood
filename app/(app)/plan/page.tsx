import { Suspense } from "react";
import type { Metadata } from "next";
import { getProfile } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/notifications/format";
import { MAX_PEOPLE, MIN_PEOPLE } from "@/lib/portions/plan";
import { listRecentPlans } from "@/lib/portions/queries";
import { PlanForm } from "./plan-form";
import { SavedPlans } from "./saved-plans";

export const metadata: Metadata = { title: "Plan portions | ResQfood" };

// Start from the household size and food preferences on the profile when they are set.
async function Planner() {
  const profile = await getProfile();
  const size = Number(profile?.householdSize);
  const people = Number.isInteger(size) && size >= MIN_PEOPLE && size <= MAX_PEOPLE ? String(size) : "1";
  return <PlanForm initial={{ people, hunger: "normal", preferences: profile?.foodPreferences ?? [] }} />;
}

async function Recent() {
  const plans = await listRecentPlans();
  return (
    <SavedPlans
      plans={plans.map(({ id, people, hunger, preferences, plan, createdAt }) => ({
        id,
        people,
        hunger,
        preferences,
        plan,
        savedAt: formatDateTime(createdAt),
      }))}
    />
  );
}

export default function PlanPage() {
  return (
    <main className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Plan portions</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          How much to cook or order for one meal. These amounts are general rules of thumb, not nutrition advice.
        </p>
      </div>
      <Suspense fallback={<div className="h-64 max-w-4xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <Planner />
      </Suspense>
      <Suspense fallback={<div className="h-24 max-w-4xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <Recent />
      </Suspense>
    </main>
  );
}
