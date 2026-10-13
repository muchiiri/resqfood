"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { KgChartRow, ValueChartRow } from "@/lib/waste/stats";

const kgConfig = {
  eaten: { label: "Eaten", color: "var(--chart-1)" },
  shared: { label: "Shared", color: "var(--chart-2)" },
  wasted: { label: "Thrown away", color: "var(--chart-3)" },
} satisfies ChartConfig;

const valueConfig = {
  saved: { label: "Saved", color: "var(--chart-1)" },
  wasted: { label: "Wasted", color: "var(--chart-3)" },
} satisfies ChartConfig;

function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className="text-sm">
      <summary className="w-fit cursor-pointer rounded-lg font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        Show data as a table
      </summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b text-muted-foreground">
              {head.map((cell) => (
                <th key={cell} scope="col" className="py-1 pr-4 font-semibold">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row[0])} className="border-b last:border-0">
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="py-1 pr-4 font-medium">
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className="py-1 pr-4">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function KgChart({ rows }: { rows: KgChartRow[] }) {
  return (
    <section aria-labelledby="kg-chart-title" className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
      <h2 id="kg-chart-title" className="font-bold">
        Food by month (kg)
      </h2>
      <ChartContainer config={kgConfig} className="h-56 w-full" role="img" aria-label="Stacked bars of kg eaten, shared and thrown away per month. The same numbers are in the table below.">
        <BarChart data={rows} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={36} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="eaten" stackId="kg" fill="var(--color-eaten)" />
          <Bar dataKey="shared" stackId="kg" fill="var(--color-shared)" />
          <Bar dataKey="wasted" stackId="kg" fill="var(--color-wasted)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      <DataTable
        caption="Kilograms eaten, shared and thrown away per month"
        head={["Month", "Eaten (kg)", "Shared (kg)", "Thrown away (kg)"]}
        rows={rows.map((r) => [r.month, r.eaten, r.shared, r.wasted])}
      />
    </section>
  );
}

export function ValueChart({ rows }: { rows: ValueChartRow[] }) {
  return (
    <section aria-labelledby="value-chart-title" className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
      <h2 id="value-chart-title" className="font-bold">
        Value by month (AED)
      </h2>
      <ChartContainer config={valueConfig} className="h-56 w-full" role="img" aria-label="Bars of the value in AED saved and wasted per month. The same numbers are in the table below.">
        <BarChart data={rows} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={44} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="saved" stackId="value" fill="var(--color-saved)" />
          <Bar dataKey="wasted" stackId="value" fill="var(--color-wasted)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      <DataTable
        caption="Value in AED saved and wasted per month"
        head={["Month", "Saved (AED)", "Wasted (AED)"]}
        rows={rows.map((r) => [r.month, r.saved.toFixed(2), r.wasted.toFixed(2)])}
      />
    </section>
  );
}
