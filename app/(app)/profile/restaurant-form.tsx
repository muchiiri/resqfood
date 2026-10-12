"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DAY_KEYS, DAY_LABELS, type RestaurantValues } from "@/lib/restaurant/hours";
import { MAX_ADDRESS_LENGTH, MAX_BUSINESS_NAME_LENGTH } from "@/lib/restaurant/validation";
import { saveRestaurant, type RestaurantState } from "./restaurant-actions";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  ) : null;
}

export function RestaurantForm({ initial, isNew }: { initial: RestaurantValues; isNew: boolean }) {
  const [state, formAction, pending] = useActionState<RestaurantState, FormData>(saveRestaurant, {
    values: initial,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const { values } = state;
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  // Remount the uncontrolled inputs with the returned values: React 19 resets them after each action.
  const formKey = JSON.stringify(values);

  return (
    <section aria-labelledby="business-title" className="mt-12 flex max-w-xl flex-col gap-6">
      <div>
        <h2 id="business-title" className="text-2xl font-extrabold tracking-tight">
          Business details
        </h2>
        {isNew && <p className="mt-1 text-sm text-muted-foreground">Add your business details to get started.</p>}
      </div>

      <p role="status" className={state.saved ? "rounded-xl bg-fresh-tint px-4 py-3 text-sm font-medium text-fresh" : "sr-only"}>
        {state.saved ? "Saved." : ""}
      </p>

      <form key={formKey} ref={formRef} action={formAction} noValidate className="flex flex-col gap-6">
        {state.error && (
          <p role="alert" className="rounded-xl bg-today-tint px-4 py-3 text-sm font-medium text-today">
            {state.error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input
            id="businessName"
            name="businessName"
            autoComplete="organization"
            defaultValue={values.businessName}
            aria-invalid={errors.businessName ? true : undefined}
            aria-describedby={["business-name-hint", errors.businessName ? "business-name-error" : null]
              .filter(Boolean)
              .join(" ")}
            className="h-11 bg-card"
          />
          <p id="business-name-hint" className="text-sm text-muted-foreground">
            Up to {MAX_BUSINESS_NAME_LENGTH} characters.
          </p>
          <FieldError id="business-name-error" message={errors.businessName} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            autoComplete="street-address"
            defaultValue={values.address}
            aria-invalid={errors.address ? true : undefined}
            aria-describedby={["address-hint", errors.address ? "address-error" : null].filter(Boolean).join(" ")}
            className="h-11 bg-card"
          />
          <p id="address-hint" className="text-sm text-muted-foreground">
            Up to {MAX_ADDRESS_LENGTH} characters.
          </p>
          <FieldError id="address-error" message={errors.address} />
        </div>

        <fieldset className="flex flex-col gap-3" aria-describedby={["hours-hint", errors.hours ? "hours-error" : null].filter(Boolean).join(" ")}>
          <legend className="mb-1 text-sm font-medium">Opening hours</legend>
          <p id="hours-hint" className="text-sm text-muted-foreground">
            Tick Closed for days you are not open. A closing time earlier than the opening time means you close after
            midnight.
          </p>
          <FieldError id="hours-error" message={errors.hours} />
          {DAY_KEYS.map((day, i) => {
            const dayError = errors[`hours.${day}`];
            const value = values.hours[day];
            return (
              <fieldset key={day} className="flex flex-col gap-2 rounded-xl border bg-card p-3">
                <legend className="px-1 text-sm font-semibold">{DAY_LABELS[day]}</legend>
                <label className="flex min-h-11 items-center gap-3">
                  <input
                    type="checkbox"
                    name={`closed_${day}`}
                    defaultChecked={value.closed}
                    aria-invalid={i === 0 && errors.hours ? true : undefined}
                    className="size-4 accent-primary"
                  />
                  <span className="font-medium">Closed</span>
                </label>
                <div className="flex gap-3">
                  <div className="flex flex-1 flex-col gap-1">
                    <Label htmlFor={`open_${day}`} className="text-sm">
                      Opens
                    </Label>
                    <Input
                      id={`open_${day}`}
                      name={`open_${day}`}
                      type="time"
                      defaultValue={value.open}
                      aria-invalid={dayError ? true : undefined}
                      aria-describedby={dayError ? `hours-${day}-error` : undefined}
                      className="h-11"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Label htmlFor={`close_${day}`} className="text-sm">
                      Closes
                    </Label>
                    <Input
                      id={`close_${day}`}
                      name={`close_${day}`}
                      type="time"
                      defaultValue={value.close}
                      aria-invalid={dayError ? true : undefined}
                      aria-describedby={dayError ? `hours-${day}-error` : undefined}
                      className="h-11"
                    />
                  </div>
                </div>
                <FieldError id={`hours-${day}-error`} message={dayError} />
              </fieldset>
            );
          })}
        </fieldset>

        <Button type="submit" disabled={pending} className="h-12 rounded-full text-base font-bold">
          {pending ? "Saving..." : "Save business details"}
        </Button>
      </form>
    </section>
  );
}
