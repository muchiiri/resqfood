import type { Metadata } from "next";
import { emptyFoodItemValues } from "@/lib/pantry/items";
import { createFoodItem } from "../actions";
import { FoodItemForm } from "../food-item-form";

export const metadata: Metadata = { title: "Add item | ResQfood" };

export default function NewFoodItemPage() {
  return (
    <main>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Add item</h1>
      <FoodItemForm action={createFoodItem} initial={emptyFoodItemValues()} submitLabel="Add item" />
    </main>
  );
}
