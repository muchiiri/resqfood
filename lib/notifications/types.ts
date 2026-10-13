export const NOTIFICATION_TYPES = ["expiry", "nearby", "claims"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  expiry: "Expiry reminder",
  nearby: "Nearby listing",
  claims: "Claim",
};

export const isNotificationType = (v: unknown): v is NotificationType =>
  typeof v === "string" && (NOTIFICATION_TYPES as readonly string[]).includes(v);

export type AppNotification = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
};
