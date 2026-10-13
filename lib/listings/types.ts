import type { Category, Unit } from "@/lib/pantry/items";

export type ListingStatus = "available" | "claimed" | "collected" | "expired";

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  available: "Available",
  claimed: "Claimed",
  collected: "Collected",
  expired: "Expired",
};

export const isListingStatus = (v: unknown): v is ListingStatus =>
  typeof v === "string" && Object.keys(LISTING_STATUS_LABELS).includes(v);

export type Listing = {
  id: string;
  posterId: string;
  title: string;
  description: string | null;
  category: Category;
  quantity: number;
  unit: Unit;
  photoPath: string | null;
  pickupArea: string;
  availableUntil: string;
  status: ListingStatus;
  createdAt: string;
  restaurantId: string | null;
  restaurantName: string | null;
};

// What the posting form holds: every field as the user typed it.
export type ListingValues = {
  title: string;
  category: string;
  quantity: string;
  unit: string;
  description: string;
  pickupArea: string;
  pickupDetails: string;
  availableUntil: string;
};

export const emptyListingValues = (): ListingValues => ({
  title: "",
  category: "",
  quantity: "",
  unit: "",
  description: "",
  pickupArea: "",
  pickupDetails: "",
  availableUntil: "",
});
