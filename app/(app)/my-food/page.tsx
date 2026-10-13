import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { CATEGORY_LABELS, KIND_LABELS, UNIT_LABELS } from "@/lib/pantry/items";
import { ExpiryBadge } from "@/app/components/expiry-badge";
import { getExpiryStatus, todayInDubai } from "@/lib/pantry/expiry";
import { formatDate } from "@/lib/pantry/format";
import { listFoodItems } from "@/lib/pantry/queries";
import { RecentOutcomes } from "./recent-outcomes";

export const metadata: Metadata = { title: "My Food | ResQfood" };

const addLinkClass =
  "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

async function FoodList() {
  const items = await listFoodItems();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card p-6">
        <p className="text-sm text-muted-foreground">Your pantry is empty. Add groceries and leftovers to keep track of them.</p>
        <Link href="/my-food/new" className={`${addLinkClass} mt-4`}>
          <Plus className="size-5" aria-hidden="true" />
          Add item
        </Link>
      </div>
    );
  }

  const today = todayInDubai();

  return (
    <ul className="flex max-w-2xl flex-col gap-3">
      {items.map((item) => {
        const { status, daysLeft } = getExpiryStatus(item.expiresAt, today);
        return (
        <li key={item.id}>
          <Link
            href={`/my-food/${item.id}/edit`}
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.quantity} {UNIT_LABELS[item.unit]} · {CATEGORY_LABELS[item.category]} · {KIND_LABELS[item.kind]}
              </p>
              <p className="text-sm text-muted-foreground">
                Bought or saved {formatDate(item.purchasedAt)} · Expires {formatDate(item.expiresAt)}
              </p>
            </div>
            <ExpiryBadge status={status} daysLeft={daysLeft} />
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">Edit {item.name}</span>
          </Link>
        </li>
        );
      })}
    </ul>
  );
}

function ListSkeleton() {
  return (
    <div className="flex max-w-2xl flex-col gap-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

export default function MyFoodPage() {
  return (
    <main>
      <div className="mb-6 flex max-w-2xl items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">My Food</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/listings"
            className="rounded-lg text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            My listings
          </Link>
          <Link href="/my-food/new" className={addLinkClass}>
            <Plus className="size-5" aria-hidden="true" />
            Add item
          </Link>
        </div>
      </div>
      <Suspense fallback={<ListSkeleton />}>
        <FoodList />
      </Suspense>
      <Suspense fallback={null}>
        <RecentOutcomes />
      </Suspense>
    </main>
  );
}
