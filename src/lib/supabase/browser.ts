import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolvePublicSupabaseEnv } from "./publicEnv";

let client: SupabaseClient | null | undefined;

/** Browser anon client. Never use the service role here. Never throw. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;

  const env = resolvePublicSupabaseEnv();
  if (!env) {
    client = null;
    return client;
  }

  try {
    client = createClient(env.url, env.key);
  } catch {
    client = null;
  }
  return client;
}
