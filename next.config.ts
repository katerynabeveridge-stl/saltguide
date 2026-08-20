import type { NextConfig } from "next";
import {
  hostedSupabaseEnvError,
  inspectPublicSupabaseEnv,
} from "./src/lib/supabase/publicEnv";

const hostedBuild = Boolean(process.env.CF_PAGES || process.env.CI);
const { env: supabaseEnv, issue } = inspectPublicSupabaseEnv();

if (hostedBuild && (!supabaseEnv || issue)) {
  throw new Error(hostedSupabaseEnvError(issue ?? "missing_url"));
}

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    root: process.cwd(),
  },
  ...(supabaseEnv
    ? {
        env: {
          NEXT_PUBLIC_SUPABASE_URL: supabaseEnv.url,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseEnv.key,
        },
      }
    : {}),
};

export default nextConfig;
