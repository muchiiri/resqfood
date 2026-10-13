"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Search, UserRound } from "lucide-react";
import { unreadLabel } from "@/lib/notifications/format";
import { UnreadBadge } from "./unread-badge";

const iconButton =
  "relative grid size-10 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function TopBar({ onProfile, unreadCount }: { onProfile: () => void; unreadCount: number }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 bg-background/90 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={onProfile}
        aria-label={unreadCount > 0 ? `Open profile menu, ${unreadLabel(unreadCount)}` : "Open profile menu"}
        className={`${iconButton} bg-secondary text-secondary-foreground md:order-3`}
      >
        <UserRound className="size-5" aria-hidden="true" />
        <UnreadBadge count={unreadCount} className="absolute -right-1 -top-1 md:hidden" />
      </button>
      <Image
        src="/logo.jpg"
        alt="ResQfood"
        width={40}
        height={40}
        className="ml-auto size-10 rounded-full object-cover md:order-1 md:ml-0 lg:hidden"
      />
      <label className="relative mx-auto hidden max-w-xl flex-1 lg:order-1 lg:block">
        <span className="sr-only">Search</span>
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          disabled
          placeholder="Search food, bakeries, campus dining"
          className="h-11 w-full rounded-full border bg-card pl-10 pr-4 text-sm"
        />
      </label>
      <div className="hidden flex-1 md:block lg:hidden" />
      <Link
        href="/notifications"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadLabel(unreadCount)}` : "Notifications"}
        className={`${iconButton} hidden hover:bg-muted md:order-2 md:grid`}
      >
        <Bell className="size-5" aria-hidden="true" />
        <UnreadBadge count={unreadCount} className="absolute -right-1 -top-1" />
      </Link>
    </header>
  );
}
