import { Suspense } from "react";
import type { Metadata } from "next";
import { formatDateTime } from "@/lib/notifications/format";
import { getUnreadCount, listNotifications } from "@/lib/notifications/queries";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/notifications/types";
import { MarkAllButton } from "./mark-all-button";
import { NotificationItem } from "./notification-item";

export const metadata: Metadata = { title: "Notifications | ResQfood" };

async function NotificationList() {
  const [notifications, unread] = await Promise.all([listNotifications(), getUnreadCount()]);

  if (notifications.length === 0) {
    return (
      <p className="max-w-2xl rounded-2xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
        You have no notifications yet.
      </p>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {unread > 0 && (
        <div className="flex justify-end">
          <MarkAllButton />
        </div>
      )}
      <ul className="flex flex-col gap-3">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            id={n.id}
            message={n.message}
            read={n.read}
            typeLabel={NOTIFICATION_TYPE_LABELS[n.type]}
            whenLabel={formatDateTime(n.createdAt)}
          />
        ))}
      </ul>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex max-w-2xl flex-col gap-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <main>
      <h1 id="notifications-title" tabIndex={-1} className="mb-6 text-3xl font-extrabold tracking-tight outline-none">
        Notifications
      </h1>
      <Suspense fallback={<ListSkeleton />}>
        <NotificationList />
      </Suspense>
    </main>
  );
}
