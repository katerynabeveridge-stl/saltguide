import type { Venue } from "./types";

export type PlaceMediaLayout = "icon" | "thumb" | "hero" | "hero4";

export type PlaceMedia = {
  layout: PlaceMediaLayout;
  urls: string[];
  leadUrl?: string;
  galleryUrls: string[];
};

function trimUrl(u: string | null | undefined): string | undefined {
  const t = u?.trim();
  return t || undefined;
}

/** Ordered unique image URLs: cover first, then gallery. */
export function placeImageUrls(venue: Venue): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (u?: string) => {
    if (!u || seen.has(u)) return;
    seen.add(u);
    out.push(u);
  };
  push(trimUrl(venue.coverImageUrl));
  for (const g of venue.galleryImageUrls ?? []) {
    push(trimUrl(g));
  }
  return out;
}

/**
 * Listing card media layout:
 * - 0 images → icon
 * - 1 image, not salt/featured → thumb
 * - 1–3 + salt/featured, or 2–3 total → hero
 * - 4+ → hero + 3
 */
export function resolvePlaceMedia(venue: Venue): PlaceMedia {
  const urls = placeImageUrls(venue);
  const n = urls.length;
  const elevate = Boolean(venue.sp || venue.isFeatured);

  let layout: PlaceMediaLayout;
  if (n === 0) layout = "icon";
  else if (n >= 4) layout = "hero4";
  else if (n === 1 && !elevate) layout = "thumb";
  else layout = "hero";

  return {
    layout,
    urls,
    leadUrl: urls[0],
    galleryUrls: n >= 4 ? urls.slice(1, 4) : [],
  };
}

export const PLACE_TYPE_ICON: Record<string, { icon: string; c: string }> = {
  restaurant: { icon: "🍽️", c: "#FFA13D" },
  cafe: { icon: "☕", c: "#FFA13D" },
  bakery: { icon: "🥐", c: "#FFA13D" },
  takeaway: { icon: "🥡", c: "#FFA13D" },
  bar: { icon: "🍸", c: "#FF6B57" },
  pub: { icon: "🍺", c: "#FF6B57" },
  museum: { icon: "🏛️", c: "#B9A8FF" },
  gallery: { icon: "🎨", c: "#B9A8FF" },
  theatre: { icon: "🎭", c: "#6FD5FF" },
  music_venue: { icon: "🎸", c: "#FF7AC6" },
  cinema: { icon: "🎬", c: "#6FD5FF" },
  workshop: { icon: "✂️", c: "#7BE8C0" },
  gym: { icon: "💪", c: "#9BE87B" },
  yoga_studio: { icon: "🧘", c: "#9BE87B" },
  sauna: { icon: "🧖", c: "#9BE87B" },
  swim_spot: { icon: "🏊", c: "#6FD5FF" },
  beach: { icon: "🏖️", c: "#6FD5FF" },
  park: { icon: "🌳", c: "#C8F135" },
  garden: { icon: "🌿", c: "#9BE87B" },
  playground: { icon: "🛝", c: "#C8F135" },
  soft_play: { icon: "🎈", c: "#FF7AC6" },
  play_cafe: { icon: "☕", c: "#FF7AC6" },
  farm: { icon: "🐄", c: "#9BE87B" },
  shop: { icon: "🛍️", c: "#B9A8FF" },
  market: { icon: "🧺", c: "#C8F135" },
  holiday_let: { icon: "🛏️", c: "#6FD5FF" },
};

export function placeTypeVisual(types: string[]): { icon: string; c: string } {
  for (const t of types) {
    if (PLACE_TYPE_ICON[t]) return PLACE_TYPE_ICON[t];
  }
  return { icon: "📍", c: "#C8F135" };
}
