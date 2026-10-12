"use client";

import Link from "next/link";
import { Carrot, ScanLine, Share2, Utensils, type LucideIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const ACTIONS: { label: string; icon: LucideIcon; tint: string; href?: string }[] = [
  { label: "Share food", icon: Share2, tint: "bg-today-tint text-orange" },
  { label: "Add item", icon: Carrot, tint: "bg-fresh-tint text-fresh", href: "/my-food/new" },
  { label: "Scan receipt", icon: ScanLine, tint: "bg-expiring-tint text-expiring" },
  { label: "Plan portions", icon: Utensils, tint: "bg-primary-tint text-primary" },
];

const rowClass =
  "flex min-h-14 w-full items-center gap-3 border-b py-2 text-left font-semibold outline-none last:border-0 focus-visible:ring-3 focus-visible:ring-ring/50";

export function CreateDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-md">
        <DrawerHeader>
          <DrawerTitle>Create</DrawerTitle>
          <DrawerDescription>More actions arrive in later features.</DrawerDescription>
        </DrawerHeader>
        <ul className="px-4 pb-8">
          {ACTIONS.map(({ label, icon: Icon, tint, href }) => {
            const content = (
              <>
                <span className={`grid size-10 place-items-center rounded-lg ${tint}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {label}
              </>
            );
            return (
              <li key={label}>
                {href ? (
                  <Link href={href} onClick={() => onOpenChange(false)} className={rowClass}>
                    {content}
                  </Link>
                ) : (
                  <button type="button" aria-disabled="true" className={rowClass}>
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}
