import { Suspense } from "react";
import type { Metadata } from "next";
import { SectionTabs } from "@/app/components/section-tabs";
import { getProfile } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/notifications/format";
import { MAX_PEOPLE, MIN_PEOPLE } from "@/lib/portions/plan";
import { listRecentPlans } from "@/lib/portions/queries";
import { GroupForm } from "./group-form";
import { PlanForm } from "./plan-form";
import { SavedPlans } from "./saved-plans";

export const metadata: Metadata = { title: "Plan portions | ResQfood" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const TABS = [
  { id: "plan", label: "Plan portions", href: "/plan" },
  { id: "group", label: "Group planner", href: "/plan?tab=group" },
] as const;

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

async function PlanContent({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).tab;
  const tab = (Array.isArray(raw) ? raw[0] : raw) === "group" ? "group" : "plan";

  return (
    <>
      <SectionTabs label="Planner" tabs={TABS} active={tab} />

      {tab === "group" ? (
        <GroupForm />
      ) : (
        <>
          <Suspense fallback={<div className="h-64 max-w-4xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
            <Planner />
          </Suspense>
          <Suspense fallback={<div className="h-24 max-w-4xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
            <Recent />
          </Suspense>
        </>
      )}
    </>
  );
}

export default function PlanPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Plan portions</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          How much to cook or order for one meal, for yourself or for a group so it does not over-order. These amounts
          are general rules of thumb, not nutrition advice.
        </p>
      </div>
      <Suspense fallback={<div className="h-64 max-w-4xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <PlanContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
