import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, anonKey };
}

export async function createClient() {
  const { url, anonKey } = supabaseEnv();
  // Supabase reads the clock (Date.now) to check the session's expiry on every auth and query call. connection()
  // keeps that work at request time, so Cache Components does not see it while prerendering or prefetching.
  await connection();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
