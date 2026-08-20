import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/** Browser anon client. Never use the service role here. Never throw. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key || !isHttpUrl(url)) {
    client = null;
    return client;
  }

  try {
    client = createClient(url, key);
  } catch {
    client = null;
  }
  return client;
}
