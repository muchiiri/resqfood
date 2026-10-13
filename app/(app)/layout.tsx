import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/components/shell/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getUnreadCount } from "@/lib/notifications/queries";

async function SignedInShell({ children }: { children: ReactNode }) {
  const [user, unreadCount] = await Promise.all([getCurrentUser(), getUnreadCount()]);
  if (!user) redirect("/login");
  return (
    <AppShell user={user} unreadCount={unreadCount}>
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
