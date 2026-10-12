"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FOOD_PREFERENCES,
  FOOD_PREFERENCE_LABELS,
  NOTIFICATION_KEYS,
  NOTIFICATION_LABELS,
  type ProfileValues,
} from "@/lib/profile/preferences";
import { MAX_HOUSEHOLD_SIZE, MAX_LOCATION_LENGTH, MIN_HOUSEHOLD_SIZE } from "@/lib/profile/validation";
import { updateProfile, type ProfileState } from "./actions";

const checkRow =
  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 has-[:checked]:border-primary has-[:checked]:bg-primary-tint has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  ) : null;
}

export function ProfileForm({ initial, showHouseholdSize }: { initial: ProfileValues; showHouseholdSize: boolean }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(updateProfile, { values: initial });
  const formRef = useRef<HTMLFormElement>(null);
  const { values } = state;
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  // Remount the uncontrolled inputs with the returned values: React 19 resets them after each action.
  const formKey = JSON.stringify(values);

  return (
    <form key={formKey} ref={formRef} action={formAction} noValidate className="flex max-w-xl flex-col gap-6">
      {state.error && (
        <p role="alert" className="rounded-xl bg-today-tint px-4 py-3 text-sm font-medium text-today">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p role="status" className="rounded-xl bg-fresh-tint px-4 py-3 text-sm font-medium text-fresh">
          Saved.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={values.name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="h-11 bg-card"
        />
        <FieldError id="name-error" message={errors.name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Location or campus</Label>
        <Input
          id="location"
          name="location"
          defaultValue={values.location}
          aria-invalid={errors.location ? true : undefined}
          aria-describedby={["location-hint", errors.location ? "location-error" : null].filter(Boolean).join(" ")}
          className="h-11 bg-card"
        />
        <p id="location-hint" className="text-sm text-muted-foreground">
          For example, an area in Dubai or your campus. Up to {MAX_LOCATION_LENGTH} characters.
        </p>
        <FieldError id="location-error" message={errors.location} />
      </div>

      {showHouseholdSize && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="householdSize">Household size</Label>
          <Input
            id="householdSize"
            name="householdSize"
            inputMode="numeric"
            defaultValue={values.householdSize}
            aria-invalid={errors.householdSize ? true : undefined}
            aria-describedby={["household-hint", errors.householdSize ? "household-error" : null]
              .filter(Boolean)
              .join(" ")}
            className="h-11 w-32 bg-card"
          />
          <p id="household-hint" className="text-sm text-muted-foreground">
            Whole number from {MIN_HOUSEHOLD_SIZE} to {MAX_HOUSEHOLD_SIZE}.
          </p>
          <FieldError id="household-error" message={errors.householdSize} />
        </div>
      )}

      <fieldset className="flex flex-col gap-2" aria-describedby={errors.foodPreferences ? "prefs-error" : undefined}>
        <legend className="mb-1 text-sm font-medium">Food preferences</legend>
        {FOOD_PREFERENCES.map((pref, i) => (
          <label key={pref} className={checkRow}>
            <input
              type="checkbox"
              name="foodPreferences"
              value={pref}
              defaultChecked={values.foodPreferences.includes(pref)}
              aria-invalid={i === 0 && errors.foodPreferences ? true : undefined}
              className="size-4 accent-primary"
            />
            <span className="font-semibold">{FOOD_PREFERENCE_LABELS[pref]}</span>
          </label>
        ))}
        <FieldError id="prefs-error" message={errors.foodPreferences} />
      </fieldset>

      <fieldset id="notifications" className="flex scroll-mt-20 flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Notifications</legend>
        {NOTIFICATION_KEYS.map((key) => (
          <label key={key} className={checkRow}>
            <input
              type="checkbox"
              name={`notify_${key}`}
              defaultChecked={values.notifications[key]}
              className="size-4 accent-primary"
            />
            <span className="font-semibold">{NOTIFICATION_LABELS[key]}</span>
          </label>
        ))}
      </fieldset>

      <Button type="submit" disabled={pending} className="h-12 rounded-full text-base font-bold">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
