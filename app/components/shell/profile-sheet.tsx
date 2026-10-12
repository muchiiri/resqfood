"use client";

import { Bell, ChartColumn, LogOut, Settings, UserRound, type LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { logOut } from "@/app/(auth)/actions";
import { ROLE_LABELS, type Role } from "@/lib/auth/roles";

export type UserSummary = { email: string; role: Role };

const ENTRIES: { label: string; icon: LucideIcon }[] = [
  { label: "Profile", icon: UserRound },
  { label: "Waste stats", icon: ChartColumn },
  { label: "Notifications", icon: Bell },
  { label: "Settings", icon: Settings },
];

const rowClass =
  "flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProfileSheet({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserSummary;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="break-all">{user.email}</SheetTitle>
          <SheetDescription>{ROLE_LABELS[user.role]}</SheetDescription>
        </SheetHeader>
        <ul className="px-4">
          {ENTRIES.map(({ label, icon: Icon }) => (
            <li key={label}>
              <button type="button" aria-disabled="true" className={rowClass}>
                <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                {label}
              </button>
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
