import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Search, ScanLine, Share2, Utensils, type LucideIcon } from "lucide-react";
import { getCurrentUser, getProfile } from "@/lib/auth/session";
import { dubaiHour, greetingText, partOfDay, WELCOME_LINES } from "@/lib/home/greeting";
import { getHomeData } from "@/lib/home/queries";
import { activeClaims, activeListings, claimChartRows, listingChartRows } from "@/lib/home/summary";
import { formatDateTime } from "@/lib/notifications/format";
import { formatKg, kgChartRows } from "@/lib/waste/stats";
import { ScrollRow } from "@/app/components/scroll-row";
import { CategoryCards, HomeSearch, MessageCards } from "./home-cards";
import { RecipeIdeas } from "./recipe-ideas";
import { StatusChart } from "./status-charts";
import { KgChart } from "./waste-stats/stats-charts";

export const metadata: Metadata = { title: "Home | ResQfood" };

const LISTING_COLORS = {
  available: "var(--chart-1)",
  claimed: "var(--chart-4)",
  collected: "var(--chart-2)",
  expired: "var(--chart-3)",
};
const CLAIM_COLORS = {
  pending: "var(--chart-4)",
  collected: "var(--chart-1)",
  cancelled: "var(--chart-3)",
};

const QUICK_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Share food", href: "/listings/new", icon: Share2 },
  { label: "Find food", href: "/find-food", icon: Search },
  { label: "Plan portions", href: "/plan", icon: Utensils },
  { label: "Scan receipt", href: "/my-food/new#scan", icon: ScanLine },
];

async function Messages() {
  const user = await getCurrentUser();
  return user ? <MessageCards role={user.role} /> : null;
}

function RecipeSkeleton() {
  return (
    <div className="mt-6 flex gap-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 w-44 shrink-0 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex max-w-4xl flex-col gap-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

// The hour is read here, on the server, after connection() has kept the clock out of prerendering.
async function Greeting() {
  const [user, profile] = await Promise.all([getCurrentUser(), getProfile()]);
  await connection();
  const text = greetingText(partOfDay(dubaiHour(new Date())), profile?.name);
  return (
    <header>
      <h1 className="text-3xl font-extrabold tracking-tight">{text}</h1>
      {user && <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">{WELCOME_LINES[user.role]}</p>}
    </header>
  );
}

function SummaryCard({ label, value, hint, href }: { label: string; value: string; hint?: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex h-full w-36 flex-col rounded-xl bg-card p-3 shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="mt-1 text-xl font-extrabold tracking-tight">{value}</span>
      {hint && <span className="mt-0.5 text-xs text-muted-foreground">{hint}</span>}
    </Link>
  );
}

async function Dashboard() {
  const data = await getHomeData();
  if (!data) return null;

  const listingRows = listingChartRows(data.listings);
  const claimRows = claimChartRows(data.claims);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <ScrollRow
        id="summary"
        label="summary cards"
        heading="At a glance"
        items={[
          <SummaryCard
            key="listings"
            label="Active listings"
            value={String(activeListings(data.listings))}
            href="/listings"
          />,
          <SummaryCard
            key="claims"
            label="Active claims"
            value={String(activeClaims(data.claims))}
            hint={data.nextPickup ? `Collect by ${formatDateTime(data.nextPickup)}` : "No pickups waiting"}
            href="/claims"
          />,
          <SummaryCard key="today" label="Expiring today" value={String(data.expiring.today)} href="/my-food" />,
          <SummaryCard key="soon" label="Expiring in 1 to 3 days" value={String(data.expiring.soon)} href="/my-food" />,
          <SummaryCard
            key="saved"
            label="Saved this month"
            value={formatKg(data.savedThisMonthKg)}
            hint="Eaten plus shared"
            href="/waste-stats"
          />,
          <SummaryCard key="unread" label="Unread notifications" value={String(data.unread)} href="/notifications" />,
        ]}
      />

      <CategoryCards />

      <nav aria-label="Quick actions" className="flex flex-wrap gap-2">
        {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-card px-4 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-4 md:grid-cols-2">
        <StatusChart
          id="listings-chart"
          title="My listings by status"
          rows={listingRows}
          colors={LISTING_COLORS}
          emptyText="You have not shared any food yet."
          emptyHref="/listings/new"
          emptyLabel="Share food"
        />
        <StatusChart
          id="claims-chart"
          title="My claims by status"
          rows={claimRows}
          colors={CLAIM_COLORS}
          emptyText="You have not claimed any food yet."
          emptyHref="/find-food"
          emptyLabel="Find food"
        />
      </div>

      {data.totals.entries === 0 ? (
        <section aria-labelledby="waste-empty-title" className="rounded-2xl border bg-card p-4">
          <h2 id="waste-empty-title" className="font-bold">
            Food by month (kg)
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing in your waste log yet. Record what happens to your food and a monthly chart appears here.
          </p>
          <Link
            href="/waste-log"
            className="mt-3 inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Open the waste log
          </Link>
        </section>
      ) : (
        <KgChart rows={kgChartRows(data.monthly)} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col gap-6">
      <Suspense fallback={<div className="h-16 max-w-2xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <Greeting />
      </Suspense>
      <HomeSearch />
      <Suspense fallback={<div className="h-24 max-w-4xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <Messages />
      </Suspense>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
      <Suspense fallback={<RecipeSkeleton />}>
        <RecipeIdeas />
      </Suspense>
    </main>
  );
}
