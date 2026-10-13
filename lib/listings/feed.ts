import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { FEED_LIMIT, type FeedParams } from "@/lib/feed/params";
import { sanitizeSearch } from "@/lib/feed/search";
import { createClient } from "@/lib/supabase/server";
import { COLUMNS, toListing, type Row } from "./queries";
import type { Listing } from "./types";

// Other people's available listings. Row level security already hides expired ones; the app also
// removes the viewer's own listings. Only the sanitized search term and validated values reach the filter.
export async function listFeed({
  q,
  category,
  sort,
  restaurantsOnly,
}: Pick<FeedParams, "q" | "category" | "sort" | "restaurantsOnly">): Promise<Listing[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  let query = supabase.from("listings").select(COLUMNS).eq("status", "available").neq("poster_id", user.id);

  if (category) query = query.eq("category", category);
  if (restaurantsOnly) query = query.not("restaurant_id", "is", null);

  const term = sanitizeSearch(q);
  if (term) query = query.or(`title.ilike.%${term}%,pickup_area.ilike.%${term}%`);

  query =
    sort === "newest"
      ? query.order("created_at", { ascending: false })
      : query.order("available_until", { ascending: true });

  const { data, error } = await query.limit(FEED_LIMIT);
  if (error) throw new Error("Could not load the feed");
  return (data as Row[]).map(toListing);
}
