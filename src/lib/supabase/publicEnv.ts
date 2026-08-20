/** Public (anon) Supabase env. Safe to import from next.config.ts. */

export type PublicSupabaseEnv = { url: string; key: string };

export type PublicSupabaseEnvIssue =
  | "missing_url"
  | "missing_key"
  | "bad_url"
  | "truncated_key";

function clean(value: string | undefined): string {
  return (value ?? "").trim().replace(/^['"]|['"]$/g, "").trim();
}

/** Host-only `xyz.supabase.co` is common in dashboards; createClient needs a URL. */
export function normalizeSupabaseUrl(raw: string | undefined): string | null {
  const value = clean(raw);
  if (!value) return null;

  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    if (!parsed.hostname.includes(".")) return null;
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

/** Legacy JWT (three segments) or new `sb_publishable_` keys. */
export function isPublicAnonKeyShape(raw: string | undefined): boolean {
  const key = clean(raw);
  if (!key) return false;
  if (key.startsWith("sb_")) return key.length > 20;
  const parts = key.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

export function inspectPublicSupabaseEnv(
  urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL,
  keyRaw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
): {
  env: PublicSupabaseEnv | null;
  issue: PublicSupabaseEnvIssue | null;
} {
  const urlClean = clean(urlRaw);
  const keyClean = clean(keyRaw);
  if (!urlClean) return { env: null, issue: "missing_url" };
  if (!keyClean) return { env: null, issue: "missing_key" };

  const url = normalizeSupabaseUrl(urlClean);
  if (!url) return { env: null, issue: "bad_url" };
  if (!isPublicAnonKeyShape(keyClean)) {
    return { env: null, issue: "truncated_key" };
  }
  return { env: { url, key: keyClean }, issue: null };
}

export function resolvePublicSupabaseEnv(
  urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL,
  keyRaw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
): PublicSupabaseEnv | null {
  return inspectPublicSupabaseEnv(urlRaw, keyRaw).env;
}

export function hostedSupabaseEnvError(issue: PublicSupabaseEnvIssue): string {
  switch (issue) {
    case "truncated_key":
      return "NEXT_PUBLIC_SUPABASE_ANON_KEY is truncated or not a JWT. Paste the full anon key (three parts separated by dots, or an sb_publishable_ key) as a Cloudflare Pages Build variable for Production and Preview — runtime Worker secrets are not inlined into this static export. Then Retry the deployment.";
    case "bad_url":
      return "NEXT_PUBLIC_SUPABASE_URL must be an https host such as https://<project-ref>.supabase.co.";
    default:
      return "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Static export inlines these at build time — set both in Cloudflare Pages → Settings → Environment variables for Production and Preview (Build variables, not runtime-only Worker secrets), then Retry deployment. GitHub Actions secrets do not reach the Cloudflare git build.";
  }
}
