/** Pale wash of a category colour over the warm cream base. */
export function tint(hex: string, p: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const m = (base: number, c: number) => Math.round(c * p + base * (1 - p));
  return `rgb(${m(255, r)},${m(251, g)},${m(239, b)})`;
}

/**
 * Dashboard "Get signed URL" expires. Same object as a public path does not.
 * Leaves non-Supabase URLs unchanged.
 */
export function publicStorageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const marker = "/storage/v1/object/sign/";
    const i = parsed.pathname.indexOf(marker);
    if (i === -1) return url;
    parsed.pathname =
      parsed.pathname.slice(0, i) +
      "/storage/v1/object/public/" +
      parsed.pathname.slice(i + marker.length);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Pick first non-empty cover image URL. */
export function pickCoverUrl(...urls: (string | null | undefined)[]): string | undefined {
  for (const u of urls) {
    const t = u?.trim();
    if (t) return publicStorageUrl(t);
  }
  return undefined;
}

export function pickCoverAlt(
  fallback: string,
  ...alts: (string | null | undefined)[]
): string {
  for (const a of alts) {
    const t = a?.trim();
    if (t) return t;
  }
  return fallback;
}
