"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateEmail, validateSignUp, type FieldErrors } from "@/lib/auth/validation";

export type AuthState = { error?: string; fieldErrors?: FieldErrors; notice?: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").trim();
  const password = text(formData, "password");
  const { fieldErrors, role } = validateSignUp({ email, password, role: formData.get("role") });
  if (Object.keys(fieldErrors).length > 0 || !role) return { fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { role } } });

  if (error) {
    return { error: error.code === "user_already_exists" ? "An account with this email already exists." : GENERIC_ERROR };
  }
  if (!data.session) return { notice: "Account created. Please log in." };
  redirect("/");
}

export async function logIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").trim();
  const password = text(formData, "password");
  const fieldErrors: FieldErrors = {};
  const emailError = validateEmail(email);
  if (emailError) fieldErrors.email = emailError;
  if (!password) fieldErrors.password = "Enter your password.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.code === "invalid_credentials" ? "Incorrect email or password." : GENERIC_ERROR };
  }
  redirect("/");
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
