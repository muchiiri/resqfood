"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { withdrawListing } from "./actions";

export function WithdrawListing({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const trigger = useRef<HTMLButtonElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const opened = useRef(false);

  // Keep keyboard focus somewhere sensible when the control it was on disappears.
  useEffect(() => {
    if (confirming) {
      opened.current = true;
      group.current?.focus();
    } else if (opened.current) {
      trigger.current?.focus();
    }
  }, [confirming]);

  function withdraw() {
    startTransition(async () => {
      const result = await withdrawListing(id);
      if (result?.error) setError(result.error);
    });
  }

  if (!confirming) {
    return (
      <Button
        ref={trigger}
        type="button"
        variant="outline"
        onClick={() => setConfirming(true)}
        className="h-11 rounded-full px-5"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        Withdraw listing
      </Button>
    );
  }

  return (
    <div
      ref={group}
      tabIndex={-1}
      role="group"
      aria-label={`Withdraw ${title}`}
      className="flex flex-col gap-3 rounded-2xl border border-destructive/40 p-4 outline-none"
    >
      <p className="font-semibold">Withdraw this listing? This cannot be undone.</p>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={withdraw}
          disabled={pending}
          className="h-11 rounded-full bg-destructive px-5 text-white hover:bg-destructive/90"
        >
          {pending ? "Withdrawing..." : "Yes, withdraw"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="h-11 rounded-full px-5"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
