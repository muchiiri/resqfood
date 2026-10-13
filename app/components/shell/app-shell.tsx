"use client";

import { useState, type ReactNode } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BottomTabBar } from "./bottom-tab-bar";
import { CreateDrawer } from "./create-drawer";
import { DetailPanel } from "./detail-panel";
import { PickupBar } from "./pickup-bar";
import { PickupDetails } from "./pickup-details";
import { usePlaceholderPickup } from "./pickup";
import { ProfileSheet, type UserSummary } from "./profile-sheet";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { useBreakpoint } from "./use-breakpoint";

export function AppShell({
  user,
  unreadCount,
  children,
}: {
  user: UserSummary;
  unreadCount: number;
  children: ReactNode;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pickupOpen, setPickupOpen] = useState(false);
  const pickup = usePlaceholderPickup();
  const breakpoint = useBreakpoint();

  return (
    <>
      <Sidebar onCreate={() => setCreateOpen(true)} />
      <div className="flex min-h-dvh flex-col md:pl-16 lg:pl-72 lg:pr-80">
        <TopBar onProfile={() => setProfileOpen(true)} unreadCount={unreadCount} />
        <div className="flex-1 px-4 pb-44 md:px-6 md:pb-24">{children}</div>
      </div>
      <DetailPanel pickup={pickup} />
      <PickupBar pickup={pickup} onOpen={() => breakpoint !== "desktop" && setPickupOpen(true)} />
      <BottomTabBar onCreate={() => setCreateOpen(true)} />

      <CreateDrawer open={createOpen} onOpenChange={setCreateOpen} />
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} user={user} unreadCount={unreadCount} />

      {pickup && breakpoint === "mobile" && (
        <Drawer open={pickupOpen} onOpenChange={setPickupOpen}>
          <DrawerContent className="h-[100dvh] max-h-[100dvh] rounded-none">
            <DrawerTitle className="px-4 pt-4">Active pickup</DrawerTitle>
            <DrawerDescription className="sr-only">Details of your current pickup</DrawerDescription>
            <div className="overflow-y-auto p-4">
              <PickupDetails pickup={pickup} />
            </div>
          </DrawerContent>
        </Drawer>
      )}
      {pickup && breakpoint === "tablet" && (
        <Sheet open={pickupOpen} onOpenChange={setPickupOpen}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Active pickup</SheetTitle>
              <SheetDescription className="sr-only">Details of your current pickup</SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto px-4">
              <PickupDetails pickup={pickup} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
