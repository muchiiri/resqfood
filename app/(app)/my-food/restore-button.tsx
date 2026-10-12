"use client";

import { useActionState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restoreOutcome, type RestoreState } from "./actions";

export function RestoreButton({ id, name }: { id: string; name: string }) {
  const [state, formAction, pending] = useActionState<RestoreState, FormData>(restoreOutcome.bind(null, id), {});

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button type="submit" variant="outline" disabled={pending} aria-label={`Restore ${name}`} className="h-10 rounded-full px-4">
        <RotateCcw className="size-4" aria-hidden="true" />
        {pending ? "Restoring..." : "Restore"}
      </Button>
      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
