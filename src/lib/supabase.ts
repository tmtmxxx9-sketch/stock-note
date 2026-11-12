import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function readSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

const env = readSupabaseEnv();

export const supabase: SupabaseClient | null = env ? createClient(env.url, env.anonKey) : null;
