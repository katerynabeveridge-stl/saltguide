import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";

export function getBuildSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  // Node < 22 has no global WebSocket; supabase-js otherwise throws on createClient
  // and the guide silently falls back to hardcoded venues/events.
  return createClient(url, key, {
    realtime: { transport: ws as unknown as typeof WebSocket },
  });
}
