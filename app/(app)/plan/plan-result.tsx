import { COMPONENT_LABELS, type PortionPlan } from "@/lib/portions/plan";

export function PlanResult({ plan }: { plan: PortionPlan }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-2xl font-extrabold tracking-tight">{plan.totalGrams} g in total</p>
      <ul className="flex flex-col gap-2">
        {plan.components.map(({ key, grams, suggestion }) => (
          <li key={key} className="flex items-baseline justify-between gap-4 rounded-xl bg-primary-tint px-4 py-3">
            <span>
              <span className="block font-bold">{COMPONENT_LABELS[key]}</span>
              <span className="block text-sm text-muted-foreground">{suggestion}</span>
            </span>
            <span className="shrink-0 font-extrabold">{grams} g</span>
          </li>
        ))}
      </ul>
      {plan.notes.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {plan.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
