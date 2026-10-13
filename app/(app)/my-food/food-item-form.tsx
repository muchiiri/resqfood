"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  KINDS,
  KIND_LABELS,
  UNITS,
  UNIT_LABELS,
  type FoodItemValues,
} from "@/lib/pantry/items";
import { MAX_NAME_LENGTH, MAX_QUANTITY } from "@/lib/pantry/validation";
import { type FoodItemState } from "./actions";
import { DateScanner } from "./date-scanner";

type FormAction = (prev: FoodItemState, formData: FormData) => Promise<FoodItemState>;

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

export function FoodItemForm({
  action,
  initial,
  submitLabel,
}: {
  action: FormAction;
  initial: FoodItemValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FoodItemState, FormData>(action, { values: initial });
  const formRef = useRef<HTMLFormElement>(null);
  const { values } = state;
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  // Remount the uncontrolled inputs with the returned values: React 19 resets them after each action.
  const formKey = JSON.stringify(values);
  const describe = (field: keyof FoodItemValues, hint?: string) =>
    [hint, errors[field] ? `${field}-error` : null].filter(Boolean).join(" ") || undefined;

  return (
    <form key={formKey} ref={formRef} action={formAction} noValidate className="flex max-w-xl flex-col gap-6">
      {state.error && (
        <p role="alert" className="rounded-xl bg-today-tint px-4 py-3 text-sm font-medium text-today">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={values.name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describe("name", "name-hint")}
          className="h-11 bg-card"
        />
        <p id="name-hint" className="text-sm text-muted-foreground">
          Up to {MAX_NAME_LENGTH} characters.
        </p>
        <FieldError id="name-error" message={errors.name} />
      </div>

      <fieldset className="flex flex-col gap-2" aria-describedby={describe("kind")}>
        <legend className="mb-1 text-sm font-medium">Kind</legend>
        {KINDS.map((kind, i) => (
          <label key={kind} className={radioRow}>
            <input
              type="radio"
              name="kind"
              value={kind}
              defaultChecked={values.kind === kind}
              aria-invalid={i === 0 && errors.kind ? true : undefined}
              className="size-4 accent-primary"
            />
            <span className="font-semibold">{KIND_LABELS[kind]}</span>
          </label>
        ))}
        <FieldError id="kind-error" message={errors.kind} />
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          defaultValue={values.category}
          aria-invalid={errors.category ? true : undefined}
          aria-describedby={describe("category")}
          className={selectClass}
        >
          <option value="">Choose a category</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
        <FieldError id="category-error" message={errors.category} />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            inputMode="decimal"
            defaultValue={values.quantity}
            aria-invalid={errors.quantity ? true : undefined}
            aria-describedby={describe("quantity", "quantity-hint")}
            className="h-11 bg-card"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="unit">Unit</Label>
          <select
            id="unit"
            name="unit"
            defaultValue={values.unit}
            aria-invalid={errors.unit ? true : undefined}
            aria-describedby={describe("unit")}
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
      <p id="quantity-hint" className="-mt-4 text-sm text-muted-foreground">
        A number above 0, up to {MAX_QUANTITY}, with at most 2 decimals.
      </p>
      <FieldError id="quantity-error" message={errors.quantity} />
      <FieldError id="unit-error" message={errors.unit} />

      <DateScanner />

      <div className="flex flex-col gap-2">
        <Label htmlFor="purchasedAt">Bought or saved on</Label>
        <Input
          id="purchasedAt"
          name="purchasedAt"
          type="date"
          defaultValue={values.purchasedAt}
          aria-invalid={errors.purchasedAt ? true : undefined}
          aria-describedby={describe("purchasedAt")}
          className="h-11 bg-card"
        />
        <FieldError id="purchasedAt-error" message={errors.purchasedAt} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="expiresAt">Expiry date</Label>
        <Input
          id="expiresAt"
          name="expiresAt"
          type="date"
          defaultValue={values.expiresAt}
          aria-invalid={errors.expiresAt ? true : undefined}
          aria-describedby={describe("expiresAt")}
          className="h-11 bg-card"
        />
        <FieldError id="expiresAt-error" message={errors.expiresAt} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="h-12 flex-1 rounded-full text-base font-bold">
          {pending ? "Saving..." : submitLabel}
        </Button>
        <Link
          href="/my-food"
          className="inline-flex h-12 items-center rounded-full border px-6 font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
