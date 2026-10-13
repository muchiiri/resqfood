import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MY_FOOD_TABS, SectionTabs } from "@/app/components/section-tabs";
import { listMyClaims } from "@/lib/claims/queries";
import { CLAIM_STATUS_LABELS, type ClaimSummary } from "@/lib/claims/types";
import { formatDateTime } from "@/lib/notifications/format";

export const metadata: Metadata = { title: "My claims | ResQfood" };

function ClaimList({ heading, claims }: { heading: string; claims: ClaimSummary[] }) {
  return (
    <section aria-labelledby={`${heading}-title`} className="flex flex-col gap-3">
      <h2 id={`${heading}-title`} className="text-sm font-bold text-muted-foreground">
        {heading === "active" ? "Active" : "Past"}
      </h2>
      <ul className="flex flex-col gap-3">
        {claims.map((claim) => (
          <li key={claim.id}>
            <Link
              href={`/listings/${claim.listingId}`}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{claim.title}</p>
                <p className="text-sm text-muted-foreground">
                  {CLAIM_STATUS_LABELS[claim.status]} · {claim.pickupArea}
                </p>
                <p className="text-sm text-muted-foreground">
                  {claim.status === "pending"
                    ? `Collect by ${formatDateTime(claim.availableUntil)}`
                    : `Claimed ${formatDateTime(claim.claimedAt)}`}
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function MyClaims() {
  const { active, past } = await listMyClaims();

  if (active.length === 0 && past.length === 0) {
    return (
      <div className="max-w-2xl rounded-2xl border border-dashed bg-card p-6">
        <p className="text-sm text-muted-foreground">You have not claimed any food yet.</p>
        <Link
          href="/find-food"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 font-bold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Find food
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {active.length > 0 ? (
        <ClaimList heading="active" claims={active} />
      ) : (
        <p className="text-sm text-muted-foreground">You have no active claims.</p>
      )}
      {past.length > 0 && <ClaimList heading="past" claims={past} />}
    </div>
  );
}

export default function MyClaimsPage() {
  return (
    <main>
      <h1 className="mb-3 max-w-2xl text-3xl font-extrabold tracking-tight">My claims</h1>
      <SectionTabs label="My Food sections" tabs={MY_FOOD_TABS} active="claims" className="mb-5" />
      <Suspense fallback={<div className="h-24 max-w-2xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <MyClaims />
      </Suspense>
    </main>
  );
}
