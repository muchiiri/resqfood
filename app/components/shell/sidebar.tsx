"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CirclePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav";

const FILTERS = ["All", "Expiring", "Listings", "Claims"];

export function Sidebar({ onCreate }: { onCreate: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="fixed bottom-16 left-0 top-0 z-20 hidden w-16 flex-col gap-2 overflow-y-auto border-r bg-sidebar p-2 md:flex lg:w-72 lg:p-4">
      <Image
        src="/logo.jpg"
        alt="ResQfood"
        width={96}
        height={96}
        priority
        className="hidden size-24 self-center rounded-2xl object-cover lg:block"
      />
      <button
        type="button"
        onClick={onCreate}
        aria-label="Create"
        className="flex h-11 items-center justify-center gap-2 rounded-full bg-primary font-bold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <CirclePlus className="size-5" aria-hidden="true" />
        <span className="hidden lg:inline">Create</span>
      </button>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center justify-center gap-3 rounded-xl font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:justify-start lg:px-3",
                active ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
      <section aria-labelledby="library-title" className="mt-2 hidden border-t pt-4 lg:block">
        <h2 id="library-title" className="text-sm font-bold">
          My Food
        </h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f, i) => (
            <button
              key={f}
              type="button"
              disabled
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold disabled:opacity-100",
                i === 0 ? "border-primary bg-primary text-primary-foreground" : "bg-card",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Nothing here yet.</p>
      </section>
    </aside>
  );
}
