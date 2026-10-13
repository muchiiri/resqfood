"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resizeToJpeg } from "@/lib/listings/resize";
import {
  MAX_AREA_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_DETAILS_LENGTH,
  MAX_QUANTITY,
  MAX_TITLE_LENGTH,
} from "@/lib/listings/validation";
import { CATEGORIES, CATEGORY_LABELS, UNITS, UNIT_LABELS } from "@/lib/pantry/items";
import { createListing, type ListingState } from "./actions";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-card px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  ) : null;
}

export function ListingForm({ initial }: { initial: ListingState["values"] }) {
  const [state, formAction, pending] = useActionState<ListingState, FormData>(createListing, { values: initial });
  const formRef = useRef<HTMLFormElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoMessage, setPhotoMessage] = useState<string>();
  const { values } = state;
  const errors = state.fieldErrors ?? {};
  const photoError = photoMessage ?? state.photoError;

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    setPhotoMessage(undefined);
    setPreview(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      input.value = "";
      setPhotoMessage("Choose an image file.");
      return;
    }
    try {
      const resized = await resizeToJpeg(file);
      const transfer = new DataTransfer();
      transfer.items.add(resized);
      input.files = transfer.files;
      setPreview(URL.createObjectURL(resized));
    } catch {
      input.value = "";
      setPhotoMessage("Could not read that photo. Try another one.");
    }
  }

  // Remount the uncontrolled inputs with the returned values: React 19 resets them after each action.
  const formKey = JSON.stringify(values);
  const describe = (field: keyof typeof values, hint?: string) =>
    [hint, errors[field] ? `${field}-error` : null].filter(Boolean).join(" ") || undefined;

  return (
    <form key={formKey} ref={formRef} action={formAction} noValidate className="flex max-w-xl flex-col gap-6">
      {state.error && (
        <p role="alert" className="rounded-xl bg-today-tint px-4 py-3 text-sm font-medium text-today">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={values.title}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={describe("title", "title-hint")}
          className="h-11 bg-card"
        />
        <p id="title-hint" className="text-sm text-muted-foreground">
          Up to {MAX_TITLE_LENGTH} characters.
        </p>
        <FieldError id="title-error" message={errors.title} />
      </div>

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

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={values.description}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={describe("description", "description-hint")}
          className="w-full rounded-lg border border-input bg-card px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"
        />
        <p id="description-hint" className="text-sm text-muted-foreground">
          Up to {MAX_DESCRIPTION_LENGTH} characters.
        </p>
        <FieldError id="description-error" message={errors.description} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pickupArea">Pickup area</Label>
        <Input
          id="pickupArea"
          name="pickupArea"
          defaultValue={values.pickupArea}
          aria-invalid={errors.pickupArea ? true : undefined}
          aria-describedby={describe("pickupArea", "pickupArea-hint")}
          className="h-11 bg-card"
        />
        <p id="pickupArea-hint" className="text-sm text-muted-foreground">
          Shown to everyone who sees the listing, for example an area in Dubai. Up to {MAX_AREA_LENGTH} characters.
        </p>
        <FieldError id="pickupArea-error" message={errors.pickupArea} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pickupDetails">Pickup details (optional)</Label>
        <textarea
          id="pickupDetails"
          name="pickupDetails"
          rows={2}
          defaultValue={values.pickupDetails}
          aria-invalid={errors.pickupDetails ? true : undefined}
          aria-describedby={describe("pickupDetails", "pickupDetails-hint")}
          className="w-full rounded-lg border border-input bg-card px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"
        />
        <p id="pickupDetails-hint" className="text-sm text-muted-foreground">
          Building, flat or instructions. Only you can see this for now. Up to {MAX_DETAILS_LENGTH} characters.
        </p>
        <FieldError id="pickupDetails-error" message={errors.pickupDetails} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="availableUntil">Available until (UAE time)</Label>
        <Input
          id="availableUntil"
          name="availableUntil"
          type="datetime-local"
          defaultValue={values.availableUntil}
          aria-invalid={errors.availableUntil ? true : undefined}
          aria-describedby={describe("availableUntil", "availableUntil-hint")}
          className="h-11 bg-card"
        />
        <p id="availableUntil-hint" className="text-sm text-muted-foreground">
          Choose a time in the future, within the next 7 days.
        </p>
        <FieldError id="availableUntil-error" message={errors.availableUntil} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="photo">Photo (optional)</Label>
        <input
          ref={photoInput}
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          onChange={onPhotoChange}
          aria-invalid={photoError ? true : undefined}
          aria-describedby={["photo-hint", photoError ? "photo-error" : null].filter(Boolean).join(" ")}
          className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary-tint file:px-4 file:py-2 file:font-semibold file:text-primary"
        />
        <p id="photo-hint" className="flex items-center gap-1 text-sm text-muted-foreground">
          <ImagePlus className="size-4" aria-hidden="true" />
          One photo, resized on your device. If a post fails you may need to choose the photo again.
        </p>
        <FieldError id="photo-error" message={photoError} />
        {preview && (
          <Image
            src={preview}
            alt="Preview of your listing photo"
            width={160}
            height={160}
            unoptimized
            className="size-40 rounded-2xl object-cover"
          />
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="h-12 flex-1 rounded-full text-base font-bold">
          {pending ? "Posting..." : "Post listing"}
        </Button>
        <Link
          href="/listings"
          className="inline-flex h-12 items-center rounded-full border px-6 font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
