import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MY_FOOD_TABS, SectionTabs } from "@/app/components/section-tabs";
import { dubaiDate } from "@/lib/pantry/expiry";
import { formatDate } from "@/lib/pantry/format";
import { listWasteLog } from "@/lib/waste/queries";
import { EntryForm } from "./entry-form";
import { EntryList } from "./entry-list";

export const metadata: Metadata = { title: "Waste log | ResQfood" };

async function Log() {
  const entries = await listWasteLog();
  return (
    <EntryList
      entries={entries.map((entry) => ({ ...entry, dateLabel: formatDate(dubaiDate(new Date(entry.loggedAt))) }))}
    />
  );
}

export default function WasteLogPage() {
  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Waste log</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            What you ate, shared or threw away. Outcomes you record on pantry items appear here automatically.{" "}
            <Link href="/waste-stats" className="font-semibold text-primary underline">
              See your stats
            </Link>
            .
          </p>
        </div>
      </div>
      <SectionTabs label="My Food sections" tabs={MY_FOOD_TABS} active="waste-log" />
      <Suspense fallback={<div className="h-32 max-w-2xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <Log />
      </Suspense>
      <EntryForm />
    </main>
  );
}
