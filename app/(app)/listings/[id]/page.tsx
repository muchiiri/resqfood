import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, MapPin, Store } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { getPendingClaimOnListing, getViewerClaim } from "@/lib/claims/queries";
import { formatOpeningHours } from "@/lib/restaurant/hours";
import { getListingRestaurant } from "@/lib/restaurant/queries";
import { getListing, getPickupDetails, photoUrl } from "@/lib/listings/queries";
import { LISTING_STATUS_LABELS } from "@/lib/listings/types";
import { formatDateTime } from "@/lib/notifications/format";
import { CATEGORY_LABELS, UNIT_LABELS } from "@/lib/pantry/items";
import { CancelClaim, ClaimButton, MarkCollected, ReleaseClaim } from "../claim-controls";
import { WithdrawListing } from "../withdraw-listing";

export const metadata: Metadata = { title: "Listing | ResQfood" };

async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const user = await getCurrentUser();
  const isPoster = user?.id === listing.posterId;
  const claim = user && !isPoster ? await getViewerClaim(listing.id) : null;
  const claimPending = claim?.status === "pending";
  const restaurant = listing.restaurantId ? await getListingRestaurant(listing.restaurantId) : null;
  const posterClaim = isPoster && listing.status === "claimed" ? await getPendingClaimOnListing(listing.id) : null;
  // Row level security only returns these to the poster or to the active claimer.
  const details = isPoster || claimPending ? await getPickupDetails(listing.id) : null;
  const back = isPoster
    ? { href: "/listings", label: "My listings" }
    : claim
      ? { href: "/claims", label: "My claims" }
      : { href: "/find-food", label: "Find food" };

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Link
        href={back.href}
        className="inline-flex w-fit items-center gap-1 rounded-lg text-sm font-semibold text-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        {back.label}
      </Link>
      <article className="flex flex-col gap-5">
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

        {restaurant && (
          <section aria-labelledby="restaurant-title" className="rounded-2xl border bg-card p-4">
            <h2 id="restaurant-title" className="flex items-center gap-2 font-bold">
              <Store className="size-4" aria-hidden="true" />
              Restaurant
            </h2>
            <p className="mt-1 font-semibold">{restaurant.businessName}</p>
            <p className="text-sm text-muted-foreground">{restaurant.address}</p>
            <h3 className="mt-3 text-sm font-bold">Opening hours</h3>
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm">
              {formatOpeningHours(restaurant.hours).map(({ day, text }) => (
                <div key={day} className="contents">
                  <dt className="text-muted-foreground">{day}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {(isPoster || claimPending) && (
          <section aria-labelledby="pickup-details-title" className="rounded-2xl border bg-card p-4">
            <h2 id="pickup-details-title" className="font-bold">
              {isPoster
                ? "Pickup details (only you can see this)"
                : "Pickup details (shared with you because you claimed this)"}
            </h2>
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {details ??
                (isPoster ? "You did not add any pickup details." : "The poster did not add any pickup details.")}
            </p>
          </section>
        )}

        {isPoster && listing.status === "available" && <WithdrawListing id={listing.id} title={listing.title} />}

        {isPoster && listing.status === "claimed" && (
          <section aria-labelledby="claim-title" className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
            <h2 id="claim-title" className="font-bold">
              Claimed
            </h2>
            <p className="text-sm text-muted-foreground">
              Someone is collecting this. Mark it collected once you have handed it over, or release the claim to put it
              back.
            </p>
            {posterClaim && (
              <div className="flex flex-wrap gap-3">
                <MarkCollected claimId={posterClaim.id} />
                <ReleaseClaim claimId={posterClaim.id} />
              </div>
            )}
          </section>
        )}

        {!isPoster && user && listing.status === "available" && <ClaimButton listingId={listing.id} />}

        {claimPending && <CancelClaim claimId={claim.id} />}
        {claim?.status === "collected" && <p className="text-sm font-semibold">You collected this food.</p>}
      </article>
    </div>
  );
}

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <Suspense fallback={<div className="h-64 max-w-2xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <ListingDetail params={params} />
      </Suspense>
    </main>
  );
}
