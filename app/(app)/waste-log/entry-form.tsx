"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UNITS, UNIT_LABELS } from "@/lib/pantry/items";
import { OUTCOMES, OUTCOME_LABELS } from "@/lib/pantry/outcomes";
import { emptyWasteEntryValues, MAX_NAME_LENGTH } from "@/lib/waste/validation";
import { addWasteEntry, type AddEntryState } from "./actions";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-card px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm";
const radioRow =
  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 has-[:checked]:border-primary has-[:checked]:bg-primary-tint has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  ) : null;
}

export function EntryForm() {
  const [state, formAction, pending] = useActionState<AddEntryState, FormData>(addWasteEntry, {
    values: emptyWasteEntryValues(),
  });
  const formRef = useRef<HTMLFormElement>(null);
  const { values } = state;
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  // Remount the uncontrolled inputs with the returned values: React 19 resets them after each action.
  const formKey = JSON.stringify(values) + (state.message ?? "");

  return (
    <section aria-labelledby="log-food-title" className="flex max-w-xl flex-col gap-4">
      <h2 id="log-food-title" className="text-xl font-extrabold">
        Log food
      </h2>
      <p role="status" className="text-sm font-medium text-fresh">
        {state.message ?? ""}
      </p>
      <form key={formKey} ref={formRef} action={formAction} noValidate className="flex flex-col gap-5">
        {state.error && (
          <p role="alert" className="rounded-xl bg-today-tint px-4 py-3 text-sm font-medium text-today">
            {state.error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="entry-name">What was it?</Label>
          <Input
            id="entry-name"
            name="name"
            maxLength={MAX_NAME_LENGTH}
            defaultValue={values.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "entry-name-error" : undefined}
            className="h-11 bg-card"
          />
          <FieldError id="entry-name-error" message={errors.name} />
        </div>

        <fieldset className="flex flex-col gap-2" aria-describedby={errors.outcome ? "entry-outcome-error" : undefined}>
          <legend className="mb-1 text-sm font-medium">What happened to it?</legend>
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
          <FieldError id="entry-outcome-error" message={errors.outcome} />
        </fieldset>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="entry-quantity">Quantity</Label>
            <Input
              id="entry-quantity"
              name="quantity"
              inputMode="decimal"
              defaultValue={values.quantity}
              aria-invalid={errors.quantity ? true : undefined}
              aria-describedby={errors.quantity ? "entry-quantity-error" : undefined}
              className="h-11 bg-card"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="entry-unit">Unit</Label>
            <select
              id="entry-unit"
              name="unit"
              defaultValue={values.unit}
              aria-invalid={errors.unit ? true : undefined}
              aria-describedby={errors.unit ? "entry-unit-error" : undefined}
              className={selectClass}
            >
              <option value="">Choose a unit</option>
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {UNIT_LABELS[unit]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <FieldError id="entry-quantity-error" message={errors.quantity} />
        <FieldError id="entry-unit-error" message={errors.unit} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="entry-weight">Weight in kg (optional)</Label>
          <Input
            id="entry-weight"
            name="weightKg"
            inputMode="decimal"
            defaultValue={values.weightKg}
            aria-invalid={errors.weightKg ? true : undefined}
            aria-describedby={["entry-weight-hint", errors.weightKg ? "entry-weight-error" : null]
              .filter(Boolean)
              .join(" ")}
            className="h-11 w-40 bg-card"
          />
          <p id="entry-weight-hint" className="text-sm text-muted-foreground">
            Filled in for you when the unit is kg or g. Leave empty if you do not know.
          </p>
          <FieldError id="entry-weight-error" message={errors.weightKg} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="entry-value">Estimated value in AED (optional)</Label>
          <Input
            id="entry-value"
            name="estimatedValue"
            inputMode="decimal"
            defaultValue={values.estimatedValue}
            aria-invalid={errors.estimatedValue ? true : undefined}
            aria-describedby={["entry-value-hint", errors.estimatedValue ? "entry-value-error" : null]
              .filter(Boolean)
              .join(" ")}
            className="h-11 w-40 bg-card"
          />
          <p id="entry-value-hint" className="text-sm text-muted-foreground">
            What this amount was worth. Leave empty if you do not know.
          </p>
          <FieldError id="entry-value-error" message={errors.estimatedValue} />
        </div>

        <Button type="submit" disabled={pending} className="h-12 w-fit rounded-full px-6 font-bold">
          <Plus className="size-4" aria-hidden="true" />
          {pending ? "Adding..." : "Add entry"}
        </Button>
      </form>
    </section>
  );
}
