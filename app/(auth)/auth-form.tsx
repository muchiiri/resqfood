"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES, ROLE_LABELS } from "@/lib/auth/roles";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import { logIn, signUp, type AuthState } from "./actions";

const COPY = {
  login: {
    title: "Welcome back",
    submit: "Log in",
    pending: "Logging in...",
    switchText: "New to ResQfood?",
    switchLink: "Create an account",
    switchHref: "/signup",
  },
  signup: {
    title: "Create your account",
    submit: "Sign up",
    pending: "Creating account...",
    switchText: "Already have an account?",
    switchLink: "Log in",
    switchHref: "/login",
  },
};

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  ) : null;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const copy = COPY[mode];
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "login" ? logIn : signUp,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-5">
      <h1 className="text-3xl font-extrabold tracking-tight">{copy.title}</h1>

      {state.error && (
        <p role="alert" className="rounded-xl bg-today-tint px-4 py-3 text-sm font-medium text-today">
          {state.error}
        </p>
      )}
      {state.notice && (
        <p role="status" className="rounded-xl bg-fresh-tint px-4 py-3 text-sm font-medium text-fresh">
          {state.notice}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="h-11 bg-card"
        />
        <FieldError id="email-error" message={errors.email} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={
            [mode === "signup" ? "password-hint" : null, errors.password ? "password-error" : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className="h-11 bg-card"
        />
        {mode === "signup" && (
          <p id="password-hint" className="text-sm text-muted-foreground">
            At least {MIN_PASSWORD_LENGTH} characters.
          </p>
        )}
        <FieldError id="password-error" message={errors.password} />
      </div>

      {mode === "signup" && (
        <fieldset
          className="flex flex-col gap-2"
          aria-describedby={errors.role ? "role-error" : undefined}
        >
          <legend className="mb-1 text-sm font-medium">I am a</legend>
          {ROLES.map((role, i) => (
            <label
              key={role}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 has-[:checked]:border-primary has-[:checked]:bg-primary-tint has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
            >
              <input
                type="radio"
                name="role"
                value={role}
                required
                aria-invalid={i === 0 && errors.role ? true : undefined}
                className="size-4 accent-primary"
              />
              <span className="font-semibold">{ROLE_LABELS[role]}</span>
            </label>
          ))}
          <FieldError id="role-error" message={errors.role} />
        </fieldset>
      )}

      <Button type="submit" disabled={pending} className="h-12 rounded-full text-base font-bold">
        {pending ? copy.pending : copy.submit}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {copy.switchText}{" "}
        <Link href={copy.switchHref} className="font-semibold text-primary underline-offset-4 hover:underline">
          {copy.switchLink}
        </Link>
      </p>
    </form>
  );
}
