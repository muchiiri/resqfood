"use client";

import { useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UNIT_LABELS } from "@/lib/pantry/items";
import { OUTCOME_LABELS } from "@/lib/pantry/outcomes";
import type { WasteEntry } from "@/lib/waste/types";
import { deleteWasteEntry } from "./actions";

export type EntryView = WasteEntry & { dateLabel: string };

export function EntryList({ entries }: { entries: EntryView[] }) {
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string>();
  const [, startTransition] = useTransition();
  const heading = useRef<HTMLHeadingElement>(null);

  function remove(id: string) {
    setBusy(id);
    setError(undefined);
    startTransition(async () => {
      const result = await deleteWasteEntry(id);
      setBusy(undefined);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "");
      // The deleted row is gone, so move focus to the list heading.
      heading.current?.focus();
    });
  }

  return (
    <section aria-labelledby="log-title" className="flex max-w-2xl flex-col gap-3">
      <h2 id="log-title" ref={heading} tabIndex={-1} className="text-xl font-extrabold outline-none">
        Your log
      </h2>
      <p role="status" className="sr-only">
        {message}
      </p>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing logged yet. Record an outcome on a pantry item or log food below.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{entry.name}</p>
                <p className="text-sm text-muted-foreground">
                  {OUTCOME_LABELS[entry.outcome]} · {entry.quantity} {UNIT_LABELS[entry.unit]} · {entry.dateLabel}
                </p>
                <p className="text-sm text-muted-foreground">
                  {entry.weightKg === null ? "Weight not provided" : `${entry.weightKg} kg`}
                  {" · "}
                  {entry.estimatedValue === null ? "Value not provided" : `AED ${entry.estimatedValue.toFixed(2)}`}
                </p>
              </div>
              {entry.manual && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => remove(entry.id)}
                  disabled={busy === entry.id}
                  aria-label={`Delete log entry ${entry.name}, ${entry.dateLabel}`}
                  className="h-10 shrink-0 rounded-full px-4"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  {busy === entry.id ? "Deleting..." : "Delete"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
