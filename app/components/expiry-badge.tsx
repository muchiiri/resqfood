import type { ExpiryStatus } from "@/lib/pantry/expiry";

const STYLES: Record<ExpiryStatus, string> = {
  fresh: "bg-fresh-tint text-fresh",
  soon: "bg-expiring-tint text-expiring",
  today: "bg-today-tint text-today",
  expired: "bg-expired text-expired-foreground",
};

function label(status: ExpiryStatus, daysLeft: number): string {
  if (status === "expired") return "Expired";
  if (status === "today") return "Expires today";
  if (status === "soon") return `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;
  return "Fresh";
}

export function ExpiryBadge({ status, daysLeft }: { status: ExpiryStatus; daysLeft: number }) {
  return (
    <span className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STYLES[status]}`}>
      {label(status, daysLeft)}
    </span>
  );
}
