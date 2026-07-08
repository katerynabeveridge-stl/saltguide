/** Pick first non-empty cover image URL. */
export function pickCoverUrl(...urls: (string | null | undefined)[]): string | undefined {
  for (const u of urls) {
    const t = u?.trim();
    if (t) return t;
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
