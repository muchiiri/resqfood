import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExpiryBadge } from "@/app/components/expiry-badge";
import { getExpiryStatus, todayInDubai } from "@/lib/pantry/expiry";
import { getFoodItem } from "@/lib/pantry/queries";
import { updateFoodItem } from "../../actions";
import { DeleteItem } from "../../delete-item";
import { FoodItemForm } from "../../food-item-form";

export const metadata: Metadata = { title: "Edit item | ResQfood" };

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getFoodItem(id);
  if (!item) notFound();
  const { status, daysLeft } = getExpiryStatus(item.expiresAt, todayInDubai());

  return (
    <div className="flex flex-col gap-10">
      <div>
        <ExpiryBadge status={status} daysLeft={daysLeft} />
      </div>
      <FoodItemForm
        action={updateFoodItem.bind(null, item.id)}
        initial={{
          name: item.name,
          kind: item.kind,
          category: item.category,
          quantity: String(item.quantity),
          unit: item.unit,
          purchasedAt: item.purchasedAt,
          expiresAt: item.expiresAt,
        }}
        submitLabel="Save changes"
      />
      <div className="max-w-xl">
        <DeleteItem id={item.id} name={item.name} />
      </div>
    </div>
  );
}

export default function EditFoodItemPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Edit item</h1>
      <Suspense fallback={<div className="h-64 max-w-xl animate-pulse rounded-2xl bg-muted" aria-hidden="true" />}>
        <EditForm params={params} />
      </Suspense>
    </main>
  );
}
