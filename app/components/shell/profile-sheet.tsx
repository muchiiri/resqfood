"use client";

import Link from "next/link";
import { Bell, ChartColumn, LogOut, Settings, UserRound, type LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { logOut } from "@/app/(auth)/actions";
import { ROLE_LABELS, type Role } from "@/lib/auth/roles";
import { unreadLabel } from "@/lib/notifications/format";
import { UnreadBadge } from "./unread-badge";

export type UserSummary = { email: string; role: Role };

const ENTRIES: { label: string; icon: LucideIcon; href?: string; showsUnread?: boolean }[] = [
  { label: "Profile", icon: UserRound, href: "/profile" },
  { label: "Waste stats", icon: ChartColumn, href: "/waste-stats" },
  { label: "Notifications", icon: Bell, href: "/notifications", showsUnread: true },
  { label: "Settings", icon: Settings, href: "/profile#notifications" },
];

const rowClass =
  "flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProfileSheet({
  open,
  onOpenChange,
  user,
  unreadCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserSummary;
  unreadCount: number;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="break-all">{user.email}</SheetTitle>
          <SheetDescription>{ROLE_LABELS[user.role]}</SheetDescription>
        </SheetHeader>
        <ul className="px-4">
          {ENTRIES.map(({ label, icon: Icon, href, showsUnread }) => (
            <li key={label}>
              {href ? (
                <Link
                  href={href}
                  onClick={() => onOpenChange(false)}
                  aria-label={showsUnread && unreadCount > 0 ? `${label}, ${unreadLabel(unreadCount)}` : undefined}
                  className={rowClass}
                >
                  <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                  {label}
                  {showsUnread && <UnreadBadge count={unreadCount} className="ml-auto" />}
                </Link>
              ) : (
                <button type="button" aria-disabled="true" className={rowClass}>
                  <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                  {label}
                </button>
              )}
            </li>
          ))}
          <li>
            <form action={logOut}>
              <button type="submit" className={rowClass}>
                <LogOut className="size-5 text-muted-foreground" aria-hidden="true" />
                Log out
              </button>
            </form>
          </li>
        </ul>
      </SheetContent>
    </Sheet>
  );
}
