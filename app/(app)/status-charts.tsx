"use client";

import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { StatusChartRow } from "@/lib/home/summary";
import { DataTable } from "./waste-stats/stats-charts";

export type StatusChartProps = {
  id: string;
  title: string;
  rows: StatusChartRow[];
  // One CSS colour per status key, for example "var(--chart-1)".
  colors: Record<string, string>;
  emptyText: string;
  emptyHref: string;
  emptyLabel: string;
};

// Bars of how many items are in each status. The chart is decoration: the sentence and the table carry the numbers.
export function StatusChart({ id, title, rows, colors, emptyText, emptyHref, emptyLabel }: StatusChartProps) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const config: ChartConfig = Object.fromEntries(
    rows.map((row) => [row.status, { label: row.label, color: colors[row.status] }]),
  );
  const data = rows.map((row) => ({ ...row, fill: `var(--color-${row.status})` }));
  const sentence = rows.map((row) => `${row.label} ${row.count}`).join(", ");

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
      <h2 id={`${id}-title`} className="font-bold">
        {title}
      </h2>
      {total === 0 ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">{emptyText}</p>
          <Link
            href={emptyHref}
            className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {emptyLabel}
          </Link>
        </div>
      ) : (
        <>
          <p className="sr-only">{sentence}</p>
          <ChartContainer config={config} className="h-48 w-full" aria-hidden="true">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <DataTable
            caption={title}
            head={["Status", "Count"]}
            rows={rows.map((row) => [row.label, row.count])}
          />
        </>
      )}
    </section>
  );
}
