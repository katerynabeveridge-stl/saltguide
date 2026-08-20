import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const hostedBuild = Boolean(process.env.CF_PAGES || process.env.CI);

if (hostedBuild && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Static export inlines these at build time — set both in Cloudflare Pages → Settings → Environment variables for Production and Preview, then Retry deployment.",
  );
}

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
