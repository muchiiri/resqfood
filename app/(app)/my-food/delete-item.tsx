"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteFoodItem } from "./actions";

export function DeleteItem({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await deleteFoodItem(id);
      if (result?.error) setError(result.error);
    });
  }

  if (!confirming) {
    return (
      <Button type="button" variant="outline" onClick={() => setConfirming(true)} className="h-11 rounded-full px-5">
        <Trash2 className="size-4" aria-hidden="true" />
        Delete item
      </Button>
    );
  }

  return (
    <div role="group" aria-label={`Delete ${name}`} className="flex flex-col gap-3 rounded-2xl border border-destructive/40 p-4">
      <p className="font-semibold">Delete this item? This cannot be undone.</p>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="button" onClick={remove} disabled={pending} className="h-11 rounded-full bg-destructive px-5 text-white hover:bg-destructive/90">
          {pending ? "Deleting..." : "Yes, delete"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setConfirming(false)} disabled={pending} className="h-11 rounded-full px-5">
          Cancel
        </Button>
      </div>
    </div>
  );
}
