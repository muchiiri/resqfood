"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/pantry/validation";

export type ReadState = { error?: string; done?: boolean };

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function markNotificationRead(id: string): Promise<ReadState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (!isUuid(id)) return { error: GENERIC_ERROR };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (error || !data || data.length !== 1) return { error: GENERIC_ERROR };

  revalidatePath("/", "layout");
  return { done: true };
}

export async function markAllNotificationsRead(): Promise<ReadState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);
  if (error) return { error: GENERIC_ERROR };

  revalidatePath("/", "layout");
  return { done: true };
}
