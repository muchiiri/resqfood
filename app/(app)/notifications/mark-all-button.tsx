"use client";

import { useState, useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead } from "./actions";

export function MarkAllButton() {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function markAll() {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.error) setError(result.error);
      else document.getElementById("notifications-title")?.focus();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" onClick={markAll} disabled={pending} className="h-11 rounded-full px-5">
        <CheckCheck className="size-4" aria-hidden="true" />
        {pending ? "Marking..." : "Mark all as read"}
      </Button>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
