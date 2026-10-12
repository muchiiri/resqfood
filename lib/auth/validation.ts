import { isRole, type Role } from "./roles";

export type AuthField = "email" | "password" | "role";
export type FieldErrors = Partial<Record<AuthField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(email: string): string | undefined {
  return EMAIL_PATTERN.test(email) ? undefined : "Enter a valid email address.";
}

export function validatePassword(password: string): string | undefined {
  return password.length >= MIN_PASSWORD_LENGTH
    ? undefined
    : `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
}

export function validateSignUp(input: { email: string; password: string; role: unknown }): {
  fieldErrors: FieldErrors;
  role?: Role;
} {
  const fieldErrors: FieldErrors = {};
  const email = validateEmail(input.email);
  const password = validatePassword(input.password);
  if (email) fieldErrors.email = email;
  if (password) fieldErrors.password = password;
  if (!isRole(input.role)) fieldErrors.role = "Choose a role.";
  return { fieldErrors, role: isRole(input.role) ? input.role : undefined };
}
