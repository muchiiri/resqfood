import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { MY_FOOD_TABS, SectionTabs } from "@/app/components/section-tabs";
import { listMyListings } from "@/lib/listings/queries";
import { LISTING_STATUS_LABELS } from "@/lib/listings/types";
import { formatDateTime } from "@/lib/notifications/format";
import { UNIT_LABELS } from "@/lib/pantry/items";

export const metadata: Metadata = { title: "My listings | ResQfood" };

const shareLinkClass =
  "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-bold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

async function MyListings() {
  const listings = await listMyListings();

  if (listings.length === 0) {
    return (
      <div className="max-w-2xl rounded-2xl border border-dashed bg-card p-6">
        <p className="text-sm text-muted-foreground">You have not shared any food yet.</p>
        <Link href="/listings/new" className={`${shareLinkClass} mt-4`}>
          <Plus className="size-5" aria-hidden="true" />
          Share food
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex max-w-2xl flex-col gap-3">
      {listings.map((listing) => (
        <li key={listing.id}>
          <Link
            href={`/listings/${listing.id}`}
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{listing.title}</p>
              <p className="text-sm text-muted-foreground">
                {listing.quantity} {UNIT_LABELS[listing.unit]} · {LISTING_STATUS_LABELS[listing.status]}
              </p>
              <p className="text-sm text-muted-foreground">Until {formatDateTime(listing.availableUntil)}</p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function MyListingsPage() {
  return (
    <main>
      <div className="mb-3 flex max-w-2xl items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">My listings</h1>
        <Link href="/listings/new" className={shareLinkClass}>
          <Plus className="size-5" aria-hidden="true" />
          Share food
        </Link>
      </div>
      <SectionTabs label="My Food sections" tabs={MY_FOOD_TABS} active="listings" className="mb-5" />
      <Suspense fallback={<div className="h-24 max-w-2xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <MyListings />
      </Suspense>
    </main>
  );
}
