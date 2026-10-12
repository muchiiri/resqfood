import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isCategory, isKind, isUnit, type FoodItem } from "./items";
import { isUuid } from "./validation";

const COLUMNS = "id, name, kind, category, quantity, unit, purchased_at, expires_at";

type Row = {
  id: string;
  name: string;
  kind: string;
  category: string;
  quantity: number | string;
  unit: string;
  purchased_at: string;
  expires_at: string;
};

function toFoodItem(row: Row): FoodItem {
  if (!isKind(row.kind) || !isCategory(row.category) || !isUnit(row.unit)) {
    throw new Error("Food item row has an unexpected value");
  }
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    category: row.category,
    quantity: Number(row.quantity),
    unit: row.unit,
    purchasedAt: row.purchased_at,
    expiresAt: row.expires_at,
  };
}

export async function listFoodItems(): Promise<FoodItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_items")
    .select(COLUMNS)
    .eq("owner_id", user.id)
    .order("expires_at", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error("Could not load food items");
  return (data as Row[]).map(toFoodItem);
}

export async function getFoodItem(id: string): Promise<FoodItem | null> {
  if (!isUuid(id)) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_items")
    .select(COLUMNS)
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Could not load food item");
  return data ? toFoodItem(data as Row) : null;
}
