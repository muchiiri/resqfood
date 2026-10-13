import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/components/shell/app-shell";
import type { Pickup } from "@/app/components/shell/pickup";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveClaims } from "@/lib/claims/queries";
import { listActivePostings } from "@/lib/listings/queries";
import { getUnreadCount } from "@/lib/notifications/queries";

async function SignedInShell({ children }: { children: ReactNode }) {
  const [user, unreadCount, claims, postings] = await Promise.all([
    getCurrentUser(),
    getUnreadCount(),
    getActiveClaims(),
    listActivePostings(),
  ]);
  if (!user) redirect("/login");
  const pickups: Pickup[] = [
    ...claims.map((c) => ({
      id: c.id,
      kind: "claim" as const,
      title: c.title,
      place: c.pickupArea,
      deadline: new Date(c.availableUntil),
      listingId: c.listingId,
    })),
    ...postings.map((l) => ({
      id: l.id,
      kind: "listing" as const,
      title: l.title,
      place: l.pickupArea,
      deadline: new Date(l.availableUntil),
      listingId: l.id,
      claimed: l.status === "claimed",
    })),
  ];
  return (
    <AppShell user={user} unreadCount={unreadCount} pickups={pickups}>
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SignedInShell>{children}</SignedInShell>
    </Suspense>
  );
}
