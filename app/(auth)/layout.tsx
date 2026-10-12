import { Suspense, type ReactNode } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

async function RedirectIfSignedIn() {
  if (await getCurrentUser()) redirect("/");
  return null;
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <Image
        src="/logo.jpg"
        alt="ResQfood: Good food. Second chances."
        width={160}
        height={160}
        priority
        className="size-40 self-center rounded-3xl object-cover"
      />
      {children}
    </main>
  );
}
