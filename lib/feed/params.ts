import { isCategory, type Category } from "@/lib/pantry/items";
import { MAX_SEARCH_LENGTH } from "./search";

export const PAGE_SIZE = 24;
export const MAX_PAGE = 5;
export const FEED_LIMIT = 100;

export type FeedSort = "ending" | "newest";

export type FeedParams = {
  q: string;
  category: Category | null;
  sort: FeedSort;
  page: number;
  restaurantsOnly: boolean;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export function parseFeedParams(raw: RawParams): FeedParams {
  const category = first(raw.cat);
  const page = Number.parseInt(first(raw.page), 10);
  return {
    q: first(raw.q).trim().slice(0, MAX_SEARCH_LENGTH),
    category: isCategory(category) ? category : null,
    sort: first(raw.sort) === "newest" ? "newest" : "ending",
    page: Number.isFinite(page) ? Math.min(MAX_PAGE, Math.max(1, page)) : 1,
    restaurantsOnly: first(raw.type) === "restaurants",
  };
}

// Builds a /find-food URL that keeps the current choices and changes some of them.
export function feedHref(current: FeedParams, changes: Partial<FeedParams>): string {
  const next = { ...current, page: 1, ...changes };
  const query = new URLSearchParams();
  if (next.q) query.set("q", next.q);
  if (next.category) query.set("cat", next.category);
  if (next.sort !== "ending") query.set("sort", next.sort);
  if (next.restaurantsOnly) query.set("type", "restaurants");
  if (next.page > 1) query.set("page", String(next.page));
  const text = query.toString();
  return text ? `/find-food?${text}` : "/find-food";
}
