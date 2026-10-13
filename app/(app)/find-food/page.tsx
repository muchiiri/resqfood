import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ListingCard } from "@/app/components/listing-card";
import { getProfile } from "@/lib/auth/session";
import { feedHref, PAGE_SIZE, parseFeedParams, type FeedParams, type FeedSort } from "@/lib/feed/params";
import { isNearYou, locationWords, rankNearFirst } from "@/lib/feed/near";
import { listFeed } from "@/lib/listings/feed";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/pantry/items";

export const metadata: Metadata = { title: "Find Food | ResQfood" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const chipClass =
  "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const SORTS: { value: FeedSort; label: string }[] = [
  { value: "ending", label: "Ending soonest" },
  { value: "newest", label: "Newest" },
];

function Controls({ params }: { params: FeedParams }) {
  return (
    <div className="sticky top-16 z-10 -mx-4 flex flex-col gap-3 bg-background/95 px-4 pb-3 pt-1 backdrop-blur-md md:static md:mx-0 md:gap-4 md:bg-transparent md:p-0 md:backdrop-blur-none">
      <form action="/find-food" method="get" role="search" className="flex max-w-2xl gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search by title or area</span>
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={params.q}
            maxLength={50}
            placeholder="Search by title or area"
            className="h-12 w-full rounded-full border bg-card pl-10 pr-4 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        {params.category && <input type="hidden" name="cat" value={params.category} />}
        {params.sort !== "ending" && <input type="hidden" name="sort" value={params.sort} />}
        <button
          type="submit"
          className="h-12 rounded-full bg-primary px-5 font-bold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Search
        </button>
      </form>

      <nav aria-label="Food categories" className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden">
        <Link
          href={feedHref(params, { category: null })}
          aria-current={params.category === null ? "true" : undefined}
          className={`${chipClass} ${params.category === null ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}
        >
          All
        </Link>
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={feedHref(params, { category })}
            aria-current={params.category === category ? "true" : undefined}
            className={`${chipClass} ${params.category === category ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}
          >
            {CATEGORY_LABELS[category]}
          </Link>
        ))}
      </nav>

      <nav aria-label="Sort order" className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-muted-foreground">Sort:</span>
        {SORTS.map(({ value, label }) => (
          <Link
            key={value}
            href={feedHref(params, { sort: value })}
            aria-current={params.sort === value ? "true" : undefined}
            className={`inline-flex min-h-10 items-center rounded-full px-3 font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
              params.sort === value ? "bg-primary-tint text-primary" : "text-muted-foreground hover:underline"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

async function Feed({ searchParams }: { searchParams: SearchParams }) {
  const params = parseFeedParams(await searchParams);
  const [profile, listings] = await Promise.all([getProfile(), listFeed(params)]);

  const words = locationWords(profile?.location ?? "");
  const ranked = rankNearFirst(listings, (listing) => isNearYou(listing.pickupArea, words));
  const visible = ranked.slice(0, params.page * PAGE_SIZE);
  const filtered = Boolean(params.q || params.category);

  return (
    <div className="flex flex-col gap-6">
      <Controls params={params} />

      {words.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add your location on your <Link href="/profile" className="font-semibold text-primary underline">profile</Link> to
          see listings near you first.
        </p>
      )}

      {visible.length === 0 ? (
        <div role="status" className="max-w-2xl rounded-2xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
          {filtered ? (
            <>
              Nothing matches your search or filters.{" "}
              <Link href="/find-food" className="font-semibold text-primary underline">
                Clear filters
              </Link>
            </>
          ) : (
            "No one has shared food yet. Check back soon, or share some of your own."
          )}
        </div>
      ) : (
        <>
          <p role="status" className="text-sm text-muted-foreground">
            Showing {visible.length} of {ranked.length} {ranked.length === 1 ? "listing" : "listings"}
          </p>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((listing) => (
              <li key={listing.id}>
                <ListingCard listing={listing} near={isNearYou(listing.pickupArea, words)} />
              </li>
            ))}
          </ul>
          {visible.length < ranked.length && params.page < 5 && (
            <Link
              href={feedHref(params, { page: params.page + 1 })}
              className="w-full rounded-full border bg-card px-6 py-3 text-center font-bold outline-none md:w-fit focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Show more
            </Link>
          )}
        </>
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted md:h-56" />
      ))}
    </div>
  );
}

export default function FindFood({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Find Food</h1>
      <Suspense fallback={<FeedSkeleton />}>
        <Feed searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
