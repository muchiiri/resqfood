"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  emptyGroupValues,
  groupSummary,
  MAX_GROUP,
  MIN_GROUP,
  planGroup,
  validateGroup,
  type GroupField,
  type GroupFieldErrors,
  type GroupValues,
} from "@/lib/portions/group";

const HUNGER_FIELDS: { field: GroupField; label: string }[] = [
  { field: "light", label: "Light eaters" },
  { field: "normal", label: "Normal eaters" },
  { field: "veryHungry", label: "Very hungry" },
];

const DIET_FIELDS: { field: GroupField; label: string }[] = [
  { field: "vegetarian", label: "Vegetarian" },
  { field: "vegan", label: "Vegan" },
  { field: "halal", label: "Halal" },
  { field: "glutenFree", label: "Gluten-free" },
  { field: "dairyFree", label: "Dairy-free" },
  { field: "nutAllergy", label: "Nut allergy" },
];

function CountField({
  field,
  label,
  value,
  error,
  onChange,
}: {
  field: GroupField;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        name={field}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${field}-error` : undefined}
        className="h-11 bg-card"
      />
      {error && (
        <p id={`${field}-error`} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function GroupForm() {
  const [values, setValues] = useState<GroupValues>(emptyGroupValues);
  const [copied, setCopied] = useState<{ message?: string; error?: string }>({});

  const { fieldErrors, valid } = validateGroup(values);
  const errors: GroupFieldErrors = fieldErrors;
  const plan = valid ? planGroup(valid) : null;

  function change(field: GroupField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setCopied({});
  }

  async function copy() {
    if (!valid || !plan) return;
    try {
      await navigator.clipboard.writeText(groupSummary(valid, plan));
      setCopied({ message: "Summary copied." });
    } catch {
      setCopied({ error: "Could not copy. Select the text and copy it yourself." });
    }
  }

  return (
    <div className="grid max-w-4xl gap-8 md:grid-cols-2">
      <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">
            How many people, by hunger level ({MIN_GROUP} to {MAX_GROUP} in total)
          </legend>
          {HUNGER_FIELDS.map(({ field, label }) => (
            <CountField
              key={field}
              field={field}
              label={label}
              value={values[field]}
              error={errors[field]}
              onChange={(value) => change(field, value)}
            />
          ))}
          {errors.group && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {errors.group}
            </p>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">How many of them follow each diet</legend>
          <p className="text-sm text-muted-foreground">
            Leave at 0 if nobody does. A person counts as vegan or vegetarian, not both. The other diets can overlap.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {DIET_FIELDS.map(({ field, label }) => (
              <CountField
                key={field}
                field={field}
                label={label}
                value={values[field]}
                error={errors[field]}
                onChange={(value) => change(field, value)}
              />
            ))}
          </div>
        </fieldset>
      </form>

      <section aria-labelledby="group-result-title" className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
        <h2 id="group-result-title" className="font-bold">
          Recommended for one meal
        </h2>
        {plan ? (
          <div className="flex flex-col gap-3">
            <p className="text-2xl font-extrabold tracking-tight">
              {plan.totalGrams} g for {plan.groupSize} people
            </p>
            <ul className="flex flex-col gap-2">
              {plan.lines.map((line) => (
                <li key={line.key} className="flex items-baseline justify-between gap-4 rounded-xl bg-primary-tint px-4 py-3">
                  <span>
                    <span className="block font-bold">{line.label}</span>
                    <span className="block text-sm text-muted-foreground">{line.suggestion}</span>
                  </span>
                  <span className="shrink-0 font-extrabold">{line.grams} g</span>
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
        ) : (
          <p className="text-sm text-muted-foreground">Fix the highlighted fields to see a recommendation.</p>
        )}
        <Button type="button" onClick={copy} disabled={!plan} className="h-11 w-fit rounded-full px-5">
          <Copy className="size-4" aria-hidden="true" />
          Copy summary
        </Button>
        <p role="status" className="text-sm font-medium text-fresh">
          {copied.message ?? ""}
        </p>
        {copied.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {copied.error}
          </p>
        )}
      </section>
    </div>
  );
}
