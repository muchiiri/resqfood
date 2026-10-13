import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, UtensilsCrossed } from "lucide-react";
import { photoUrl } from "@/lib/listings/queries";
import type { Listing } from "@/lib/listings/types";
import { formatDateTime } from "@/lib/notifications/format";
import { CATEGORY_LABELS, UNIT_LABELS } from "@/lib/pantry/items";

export function ListingCard({ listing, near }: { listing: Listing; near: boolean }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex h-full overflow-hidden rounded-2xl bg-card shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:flex-col"
    >
      {listing.photoPath ? (
        <Image
          src={photoUrl(listing.photoPath)}
          alt={`Photo of ${listing.title}`}
          width={400}
          height={300}
          unoptimized
          className="aspect-square w-28 shrink-0 self-stretch object-cover md:aspect-[4/3] md:w-full"
        />
      ) : (
        <span className="grid aspect-square w-28 shrink-0 place-items-center bg-primary-tint text-primary md:aspect-[4/3] md:w-full" aria-hidden="true">
          <UtensilsCrossed className="size-8" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3">
        {near && (
          <span className="w-fit rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
            Near you
          </span>
        )}
        <span className="line-clamp-2 font-bold leading-snug">{listing.title}</span>
        <span className="text-sm text-muted-foreground">
          {listing.quantity} {UNIT_LABELS[listing.unit]} · {CATEGORY_LABELS[listing.category]}
        </span>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{listing.pickupArea}</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5 shrink-0" aria-hidden="true" />
          Until {formatDateTime(listing.availableUntil)}
        </span>
      </span>
    </Link>
  );
}
