const MAX_BADGE = 99;

export const formatBadge = (count: number): string => (count > MAX_BADGE ? `${MAX_BADGE}+` : String(count));

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// UAE time of a stored timestamp, for example "12 Oct, 18:30".
export const formatDateTime = (iso: string): string => dateTimeFormat.format(new Date(iso));

export const unreadLabel = (count: number): string =>
  count === 1 ? "1 unread notification" : `${count} unread notifications`;
