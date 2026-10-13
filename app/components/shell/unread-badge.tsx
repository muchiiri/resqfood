import { formatBadge } from "@/lib/notifications/format";

// Decorative: the control it sits on carries the accessible name with the count.
export function UnreadBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className={`grid min-w-5 place-items-center rounded-full bg-orange px-1.5 text-[11px] font-bold leading-5 text-white ${className}`}
    >
      {formatBadge(count)}
    </span>
  );
}
