export const KINDS = ["grocery", "leftover"] as const;
export type Kind = (typeof KINDS)[number];
export const KIND_LABELS: Record<Kind, string> = { grocery: "Grocery", leftover: "Leftover" };

export const CATEGORIES = [
  "produce",
  "dairy",
  "meat_fish",
  "bakery",
  "dry_goods",
  "cooked_meals",
  "drinks",
  "other",
] as const;
export type Category = (typeof CATEGORIES)[number];
export const CATEGORY_LABELS: Record<Category, string> = {
  produce: "Produce",
  dairy: "Dairy",
  meat_fish: "Meat and fish",
  bakery: "Bakery",
  dry_goods: "Grains and dry goods",
  cooked_meals: "Cooked meals",
  drinks: "Drinks",
  other: "Other",
};

export const UNITS = ["pcs", "kg", "g", "l", "ml", "pack"] as const;
export type Unit = (typeof UNITS)[number];
export const UNIT_LABELS: Record<Unit, string> = {
  pcs: "pieces",
  kg: "kg",
  g: "g",
  l: "L",
  ml: "ml",
  pack: "pack",
};

export const isKind = (v: unknown): v is Kind => typeof v === "string" && (KINDS as readonly string[]).includes(v);
export const isCategory = (v: unknown): v is Category =>
  typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
export const isUnit = (v: unknown): v is Unit => typeof v === "string" && (UNITS as readonly string[]).includes(v);

export type FoodItem = {
  id: string;
  name: string;
  kind: Kind;
  category: Category;
  quantity: number;
  unit: Unit;
  purchasedAt: string;
  expiresAt: string;
};

// What the form holds: every field as the user typed it.
export type FoodItemValues = {
  name: string;
  kind: string;
  category: string;
  quantity: string;
  unit: string;
  purchasedAt: string;
  expiresAt: string;
};

export const emptyFoodItemValues = (): FoodItemValues => ({
  name: "",
  kind: "",
  category: "",
  quantity: "",
  unit: "",
  purchasedAt: "",
  expiresAt: "",
});
