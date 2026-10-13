import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, MapPin } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getListing, getPickupDetails, photoUrl } from "@/lib/listings/queries";
import { LISTING_STATUS_LABELS } from "@/lib/listings/types";
import { formatDateTime } from "@/lib/notifications/format";
import { CATEGORY_LABELS, UNIT_LABELS } from "@/lib/pantry/items";
import { WithdrawListing } from "../withdraw-listing";

export const metadata: Metadata = { title: "Listing | ResQfood" };

async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const user = await getCurrentUser();
  const isPoster = user?.id === listing.posterId;
  const details = isPoster ? await getPickupDetails(listing.id) : null;

  return (
    <article className="flex max-w-2xl flex-col gap-5">
      {listing.photoPath && (
        <Image
          src={photoUrl(listing.photoPath)}
          alt={`Photo of ${listing.title}`}
          width={800}
          height={600}
          unoptimized
          className="max-h-80 w-full rounded-2xl object-cover"
        />
      )}
      <header>
        <p className="text-sm font-semibold text-muted-foreground">{LISTING_STATUS_LABELS[listing.status]}</p>
        <h1 className="text-3xl font-extrabold tracking-tight">{listing.title}</h1>
        <p className="mt-1 text-muted-foreground">
          {listing.quantity} {UNIT_LABELS[listing.unit]} · {CATEGORY_LABELS[listing.category]}
        </p>
      </header>

      {listing.description && <p className="whitespace-pre-line">{listing.description}</p>}

      <ul className="flex flex-col gap-2 text-sm">
        <li className="flex items-center gap-2">
          <MapPin className="size-4" aria-hidden="true" />
          Pickup area: {listing.pickupArea}
        </li>
        <li className="flex items-center gap-2">
          <Clock className="size-4" aria-hidden="true" />
          Available until {formatDateTime(listing.availableUntil)} (UAE time)
        </li>
      </ul>

      {isPoster && (
        <section aria-labelledby="pickup-details-title" className="rounded-2xl border bg-card p-4">
          <h2 id="pickup-details-title" className="font-bold">
            Pickup details (only you can see this)
          </h2>
          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
            {details ?? "You did not add any pickup details."}
          </p>
        </section>
      )}

      {isPoster && listing.status === "available" && <WithdrawListing id={listing.id} title={listing.title} />}
    </article>
  );
}

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <Link
        href="/listings"
        className="mb-4 inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        My listings
      </Link>
      <Suspense fallback={<div className="h-64 max-w-2xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <ListingDetail params={params} />
      </Suspense>
    </main>
  );
}
