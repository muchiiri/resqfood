"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CirclePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav";

const tab =
  "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function BottomTabBar({ onCreate }: { onCreate: () => void }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md md:hidden"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(tab, active ? "text-primary" : "text-muted-foreground")}
          >
            <Icon className="size-6" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      <button type="button" onClick={onCreate} className={cn(tab, "text-muted-foreground")}>
        <CirclePlus className="size-6" aria-hidden="true" />
        Create
      </button>
    </nav>
  );
}
