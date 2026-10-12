import { dubaiDate } from "@/lib/pantry/expiry";
import { formatDate } from "@/lib/pantry/format";
import { UNIT_LABELS } from "@/lib/pantry/items";
import { OUTCOME_LABELS } from "@/lib/pantry/outcomes";
import { listRecentOutcomes } from "@/lib/pantry/queries";
import { RestoreButton } from "./restore-button";

export async function RecentOutcomes() {
  const outcomes = await listRecentOutcomes();
  if (outcomes.length === 0) return null;

  return (
    <details className="mt-10 max-w-2xl rounded-2xl border bg-card p-4">
      <summary className="cursor-pointer font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        Recent outcomes ({outcomes.length})
      </summary>
      <ul className="mt-4 flex flex-col gap-3">
        {outcomes.map((record) => (
          <li key={record.id} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{record.name}</p>
              <p className="text-sm text-muted-foreground">
                {record.quantity} {UNIT_LABELS[record.unit]} · {OUTCOME_LABELS[record.outcome]} ·{" "}
                {formatDate(dubaiDate(new Date(record.outcomeAt)))}
              </p>
            </div>
            <RestoreButton id={record.id} name={record.name} />
          </li>
        ))}
      </ul>
    </details>
  );
}
