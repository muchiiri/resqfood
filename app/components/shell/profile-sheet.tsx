"use client";

import { Bell, ChartColumn, LogOut, Settings, UserRound, type LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const ENTRIES: { label: string; icon: LucideIcon }[] = [
  { label: "Profile", icon: UserRound },
  { label: "Waste stats", icon: ChartColumn },
  { label: "Notifications", icon: Bell },
  { label: "Settings", icon: Settings },
  { label: "Log out", icon: LogOut },
];

export function ProfileSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Your account</SheetTitle>
          <SheetDescription>Accounts arrive in a later feature.</SheetDescription>
        </SheetHeader>
        <ul className="px-4">
          {ENTRIES.map(({ label, icon: Icon }) => (
            <li key={label}>
              <button
                type="button"
                aria-disabled="true"
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-2 text-left font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
