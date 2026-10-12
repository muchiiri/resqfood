import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/components/shell/app-shell";
import { getCurrentUser } from "@/lib/auth/session";

async function SignedInShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <AppShell user={user}>{children}</AppShell>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SignedInShell>{children}</SignedInShell>
    </Suspense>
  );
}
