import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isNotificationType, type AppNotification } from "./types";

const LIST_LIMIT = 50;

type Row = { id: string; type: string; message: string; read: boolean; created_at: string };

export async function listNotifications(): Promise<AppNotification[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, message, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT);
  if (error) throw new Error("Could not load notifications");

  return (data as Row[]).map((row) => {
    if (!isNotificationType(row.type)) throw new Error("Notification row has an unexpected type");
    return { id: row.id, type: row.type, message: row.message, read: row.read, createdAt: row.created_at };
  });
}

export async function getUnreadCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);
  if (error) throw new Error("Could not count unread notifications");
  return count ?? 0;
}
