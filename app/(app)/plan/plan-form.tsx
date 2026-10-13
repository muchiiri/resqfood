"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HUNGER_LABELS, HUNGER_LEVELS, MAX_PEOPLE, MIN_PEOPLE, planPortions } from "@/lib/portions/plan";
import { validatePortion, type PortionFieldErrors, type PortionValues } from "@/lib/portions/validation";
import { FOOD_PREFERENCES, FOOD_PREFERENCE_LABELS } from "@/lib/profile/preferences";
import { savePlan } from "./actions";
import { PlanResult } from "./plan-result";

const checkRow =
  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 has-[:checked]:border-primary has-[:checked]:bg-primary-tint has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50";

export function PlanForm({ initial }: { initial: PortionValues }) {
  const [values, setValues] = useState<PortionValues>(initial);
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<PortionFieldErrors>({});
  const [notice, setNotice] = useState<{ error?: string; message?: string }>({});
  const [pending, startTransition] = useTransition();

  const { fieldErrors, valid } = validatePortion(values);
  const errors: PortionFieldErrors = touched ? { ...fieldErrors, ...serverErrors } : serverErrors;

  function change(next: Partial<PortionValues>) {
    setValues((current) => ({ ...current, ...next }));
    setServerErrors({});
    setNotice({});
  }

  function save() {
    setTouched(true);
    if (!valid) return;
    startTransition(async () => {
      const result = await savePlan(values);
      setServerErrors(result.fieldErrors ?? {});
      setNotice({ error: result.error, message: result.message });
    });
  }

  return (
    <div className="grid max-w-4xl gap-8 md:grid-cols-2">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="people">Number of people</Label>
          <Input
            id="people"
            name="people"
            type="text"
            inputMode="numeric"
            value={values.people}
            onChange={(event) => change({ people: event.target.value })}
            onBlur={() => setTouched(true)}
            aria-invalid={errors.people ? true : undefined}
            aria-describedby={errors.people ? "people-error" : "people-hint"}
            className="h-11 bg-card"
          />
          <p id="people-hint" className="text-sm text-muted-foreground">
            A whole number from {MIN_PEOPLE} to {MAX_PEOPLE}.
          </p>
          {errors.people && (
            <p id="people-error" role="alert" className="text-sm font-medium text-destructive">
              {errors.people}
            </p>
          )}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">Hunger level</legend>
          {HUNGER_LEVELS.map((level) => (
            <label key={level} className={checkRow}>
              <input
                type="radio"
                name="hunger"
                value={level}
                checked={values.hunger === level}
                onChange={() => change({ hunger: level })}
                className="size-4 accent-primary"
              />
              {HUNGER_LABELS[level]}
            </label>
          ))}
          {errors.hunger && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {errors.hunger}
            </p>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">Preferences</legend>
          {FOOD_PREFERENCES.map((preference) => (
            <label key={preference} className={checkRow}>
              <input
                type="checkbox"
                name="preferences"
                value={preference}
                checked={values.preferences.includes(preference)}
                onChange={(event) =>
                  change({
                    preferences: event.target.checked
                      ? [...values.preferences, preference]
                      : values.preferences.filter((p) => p !== preference),
                  })
                }
                className="size-4 accent-primary"
              />
              {FOOD_PREFERENCE_LABELS[preference]}
            </label>
          ))}
          {errors.preferences && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {errors.preferences}
            </p>
          )}
        </fieldset>
      </form>

      <section aria-labelledby="plan-result-title" className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
        <h2 id="plan-result-title" className="font-bold">
          Recommended for one meal
        </h2>
        {valid ? (
          <PlanResult plan={planPortions(valid)} />
        ) : (
          <p className="text-sm text-muted-foreground">Fill in the form to see a recommendation.</p>
        )}
        <Button type="button" onClick={save} disabled={pending} className="h-11 w-fit rounded-full px-5">
          <Save className="size-4" aria-hidden="true" />
          {pending ? "Saving..." : "Save plan"}
        </Button>
        <p role="status" className="text-sm font-medium text-fresh">
          {notice.message ?? ""}
        </p>
        {notice.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {notice.error}
          </p>
        )}
      </section>
    </div>
  );
}
