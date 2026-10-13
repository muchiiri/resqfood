"use client";

import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { formatCountdown, useNow, type Pickup } from "./pickup";

const linkClass = "rounded-lg text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50";

function PickupCard({ pickup, now }: { pickup: Pickup; now: number | null }) {
  const lead =
    pickup.kind === "claim" ? "Pick up within" : pickup.claimed ? "Claimed, hand over within" : "Available for";
  return (
    <li className="flex flex-col gap-2 rounded-2xl border bg-card p-3">
      <h4 className="font-extrabold tracking-tight">{pickup.title}</h4>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4" aria-hidden="true" /> {pickup.place}
      </p>
      <p className="flex items-center gap-2 text-sm font-semibold text-today">
        <Clock className="size-4" aria-hidden="true" />
        {lead} {formatCountdown(pickup.deadline, now)}
      </p>
      <Link href={`/listings/${pickup.listingId}`} className={`w-fit text-sm font-semibold ${linkClass}`}>
        View listing
      </Link>
    </li>
  );
}

function Group({
  id,
  heading,
  items,
  now,
  href,
  linkLabel,
}: {
  id: string;
  heading: string;
  items: Pickup[];
  now: number | null;
  href: string;
  linkLabel: string;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h3 id={id} className="text-sm font-bold text-muted-foreground">
        {heading}
      </h3>
      <ul className="flex flex-col gap-3">
        {items.map((p) => (
          <PickupCard key={p.id} pickup={p} now={now} />
        ))}
      </ul>
      <Link href={href} className={`w-fit text-sm font-semibold ${linkClass}`}>
        {linkLabel}
      </Link>
    </section>
  );
}

export function PickupDetails({ pickups }: { pickups: Pickup[] }) {
  const now = useNow();
  return (
    <div className="flex flex-col gap-5">
      <Group
        id="pickups-claims"
        heading="Food you are collecting"
        items={pickups.filter((p) => p.kind === "claim")}
        now={now}
        href="/claims"
        linkLabel="My claims"
      />
      <Group
        id="pickups-listings"
        heading="Food you are giving away"
        items={pickups.filter((p) => p.kind === "listing")}
        now={now}
        href="/listings"
        linkLabel="My listings"
      />
    </div>
  );
}
