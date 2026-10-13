"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OUTCOMES, OUTCOME_LABELS, type OutcomeValues } from "@/lib/pantry/outcomes";
import { type OutcomeState } from "./actions";

type OutcomeAction = (prev: OutcomeState, formData: FormData) => Promise<OutcomeState>;

const radioRow =
  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 has-[:checked]:border-primary has-[:checked]:bg-primary-tint has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  ) : null;
}

export function OutcomeForm({
  action,
  initial,
  unitLabel,
}: {
  action: OutcomeAction;
  initial: OutcomeValues;
  unitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<OutcomeState, FormData>(action, { values: initial });
  const formRef = useRef<HTMLFormElement>(null);
  const { values } = state;
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  // Remount the uncontrolled inputs with the returned values: React 19 resets them after each action.
  const formKey = JSON.stringify(values);

  return (
    <section aria-labelledby="outcome-title" className="flex max-w-xl flex-col gap-4">
      <h2 id="outcome-title" className="text-2xl font-extrabold tracking-tight">
        Record what happened
      </h2>
      <form key={formKey} ref={formRef} action={formAction} noValidate className="flex flex-col gap-5">
        {state.error && (
          <p role="alert" className="rounded-xl bg-today-tint px-4 py-3 text-sm font-medium text-today">
            {state.error}
          </p>
        )}

        <fieldset className="flex flex-col gap-2" aria-describedby={errors.outcome ? "outcome-error" : undefined}>
          <legend className="mb-1 text-sm font-medium">Outcome</legend>
          {OUTCOMES.map((outcome, i) => (
            <label key={outcome} className={radioRow}>
              <input
                type="radio"
                name="outcome"
                value={outcome}
                defaultChecked={values.outcome === outcome}
                aria-invalid={i === 0 && errors.outcome ? true : undefined}
                className="size-4 accent-primary"
              />
              <span className="font-semibold">{OUTCOME_LABELS[outcome]}</span>
            </label>
          ))}
          <FieldError id="outcome-error" message={errors.outcome} />
        </fieldset>

        <div className="flex flex-col gap-2">
          <Label htmlFor="outcome-quantity">Quantity ({unitLabel})</Label>
          <Input
            id="outcome-quantity"
            name="quantity"
            inputMode="decimal"
            defaultValue={values.quantity}
            aria-invalid={errors.quantity ? true : undefined}
            aria-describedby={["outcome-quantity-hint", errors.quantity ? "outcome-quantity-error" : null]
              .filter(Boolean)
              .join(" ")}
            className="h-11 w-40 bg-card"
          />
          <p id="outcome-quantity-hint" className="text-sm text-muted-foreground">
            Use the full amount to finish the item, or less to record part of it.
          </p>
          <FieldError id="outcome-quantity-error" message={errors.quantity} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="outcome-weight">Weight in kg (optional)</Label>
          <Input
            id="outcome-weight"
            name="weightKg"
            inputMode="decimal"
            defaultValue={values.weightKg}
            aria-invalid={errors.weightKg ? true : undefined}
            aria-describedby={["outcome-weight-hint", errors.weightKg ? "outcome-weight-error" : null].filter(Boolean).join(" ")}
            className="h-11 w-40 bg-card"
          />
          <p id="outcome-weight-hint" className="text-sm text-muted-foreground">
            Filled in for you when the unit is kg or g. Leave empty if you do not know.
          </p>
          <FieldError id="outcome-weight-error" message={errors.weightKg} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="outcome-value">Estimated value in AED (optional)</Label>
          <Input
            id="outcome-value"
            name="estimatedValue"
            inputMode="decimal"
            defaultValue={values.estimatedValue}
            aria-invalid={errors.estimatedValue ? true : undefined}
            aria-describedby={["outcome-value-hint", errors.estimatedValue ? "outcome-value-error" : null].filter(Boolean).join(" ")}
            className="h-11 w-40 bg-card"
          />
          <p id="outcome-value-hint" className="text-sm text-muted-foreground">
            What this amount was worth. Leave empty if you do not know.
          </p>
          <FieldError id="outcome-value-error" message={errors.estimatedValue} />
        </div>

        <Button type="submit" disabled={pending} variant="outline" className="h-12 w-fit rounded-full px-6 font-bold">
          {pending ? "Recording..." : "Record outcome"}
        </Button>
      </form>
    </section>
  );
}
