import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { emptyListingValues } from "@/lib/listings/types";
import { getRestaurant } from "@/lib/restaurant/queries";
import { ListingForm } from "../listing-form";

export const metadata: Metadata = { title: "Share food | ResQfood" };

// A restaurant account shares food under its business details, so it needs a saved profile first.
async function NewListing() {
  const user = await getCurrentUser();
  const needsProfile = user?.role === "restaurant" && (await getRestaurant()) === null;

  if (needsProfile) {
    return (
      <div className="max-w-2xl rounded-2xl border border-dashed bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Add your restaurant details (business name, address and opening hours) before you share food, so people
          know where to collect it.
        </p>
        <Link
          href="/profile"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 font-bold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Go to my profile
        </Link>
      </div>
    );
  }

  return <ListingForm initial={emptyListingValues()} />;
}

export default function NewListingPage() {
  return (
    <main>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Share food</h1>
      <Suspense fallback={<div className="h-64 max-w-2xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <NewListing />
      </Suspense>
    </main>
  );
}
