import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  formatAed,
  formatKg,
  kgChartRows,
  missingDataNote,
  savedKg,
  savedValue,
  STATS_MONTHS,
  valueChartRows,
} from "@/lib/waste/stats";
import { getWasteStats } from "@/lib/waste/stats-queries";
import { KgChart, ValueChart } from "./stats-charts";

export const metadata: Metadata = { title: "Waste stats | ResQfood" };

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <li className="rounded-2xl bg-card p-4 shadow-sm">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </li>
  );
}

async function Stats() {
  const stats = await getWasteStats(STATS_MONTHS);
  if (!stats) return null;
  const { totals, monthly } = stats;

  if (totals.entries === 0) {
    return (
      <div className="max-w-2xl rounded-2xl border border-dashed bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Nothing to show yet. Record what happened to a pantry item, or log food by hand, and your totals appear here.
        </p>
        <Link
          href="/waste-log"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 font-bold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Open the waste log
        </Link>
      </div>
    );
  }

  const note = missingDataNote(totals);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <section aria-labelledby="totals-title" className="flex flex-col gap-3">
        <h2 id="totals-title" className="text-xl font-extrabold">
          All time
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Card label="Food saved" value={formatKg(savedKg(totals))} hint="Eaten plus shared" />
          <Card label="Money saved" value={formatAed(savedValue(totals))} hint="Eaten plus shared" />
          <Card label="Shared" value={formatKg(totals.sharedKg)} />
          <Card label="Wasted" value={formatKg(totals.wastedKg)} hint="Thrown away" />
          <Card label="Wasted value" value={formatAed(totals.wastedValue)} />
        </ul>
        {note && <p className="text-sm text-muted-foreground">{note}</p>}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <KgChart rows={kgChartRows(monthly)} />
        <ValueChart rows={valueChartRows(monthly)} />
      </div>
    </div>
  );
}

export default function WasteStatsPage() {
  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Waste stats</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          What your waste log adds up to. Saved means eaten or shared. The charts show the last {STATS_MONTHS} months.
        </p>
      </div>
      <Suspense fallback={<div className="h-64 max-w-4xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <Stats />
      </Suspense>
    </main>
  );
}
