"use client";

import { useRef, useState, useTransition } from "react";
import { markNotificationRead } from "./actions";

export function NotificationItem({
  id,
  message,
  read,
  typeLabel,
  whenLabel,
}: {
  id: string;
  message: string;
  read: boolean;
  typeLabel: string;
  whenLabel: string;
}) {
  const itemRef = useRef<HTMLLIElement>(null);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function markRead() {
    startTransition(async () => {
      const result = await markNotificationRead(id);
      if (result.error) setError(result.error);
      else itemRef.current?.focus();
    });
  }

  const content = (
    <>
      <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        {!read && <span className="size-2 rounded-full bg-orange" aria-hidden="true" />}
        {!read && <span className="sr-only">Unread. </span>}
        {typeLabel} · {whenLabel}
      </span>
      <span className={`mt-1 block ${read ? "" : "font-bold"}`}>{message}</span>
    </>
  );

  return (
    <li ref={itemRef} tabIndex={-1} className="rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      {read ? (
        <div className="rounded-2xl border bg-card p-4">{content}</div>
      ) : (
        <button
          type="button"
          onClick={markRead}
          disabled={pending}
          aria-label={`Mark as read: ${message}`}
          className="block w-full rounded-2xl border border-orange/40 bg-today-tint p-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {content}
        </button>
      )}
      {error && (
        <p role="alert" className="mt-1 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </li>
  );
}
