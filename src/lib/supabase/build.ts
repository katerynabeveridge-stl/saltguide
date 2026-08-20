import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { resolvePublicSupabaseEnv } from "./publicEnv";

export function getBuildSupabase(): SupabaseClient | null {
  const env = resolvePublicSupabaseEnv();
  if (!env) {
    return null;
  }

  // Node < 22 has no global WebSocket; supabase-js otherwise throws on createClient
  // and the guide silently falls back to hardcoded venues/events.
  return createClient(env.url, env.key, {
    realtime: { transport: ws as unknown as typeof WebSocket },
  });
}
