import { SOON, TEASERS, WEEK_COUNT } from "./constants";
import fallbackLinks from "./links.json";
import fallbackVenues from "./venues.json";
import type { GuideData, SoonItem, Teaser, Venue, VenueLinks } from "./types";
import { getBuildSupabase } from "../supabase/build";

function venueDescription(row: Record<string, unknown>): string {
  const short = row.description_short ? String(row.description_short) : "";
  const long = row.description_long ? String(row.description_long) : "";
  if (short) return short;
  if (long) return long;
  return row.description ? String(row.description) : "";
}

function mapRowToVenue(row: Record<string, unknown>): Venue {
  return {
    slug: String(row.slug ?? ""),
    n: String(row.name ?? ""),
    types: Array.isArray(row.types) ? (row.types as string[]) : [],
    a: String(row.area ?? ""),
    tags: Array.isArray(row.tag_slugs)
      ? (row.tag_slugs as string[])
      : Array.isArray(row.tags)
        ? (row.tags as string[])
        : [],
    b: venueDescription(row),
    tip: row.tip ? String(row.tip) : null,
    booking: row.booking === "book-ahead" ? "book-ahead" : "walk-in",
    sp: Boolean(row.is_salty_pick),
    isNew: Boolean(row.is_new),
    isFree: Boolean(row.is_free),
  };
}

function buildLinksFromRows(
  rows: Record<string, unknown>[],
): Record<string, VenueLinks> {
  const links: Record<string, VenueLinks> = {};
  for (const row of rows) {
    const slug = String(row.slug ?? "");
    if (!slug) continue;
    const entry: VenueLinks = {};
    if (row.website_url) entry.w = String(row.website_url);
    if (row.social_url) {
      const social = String(row.social_url);
      entry.ig = social.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
    }
    if (entry.w || entry.ig) links[slug] = entry;
  }
  return links;
}

async function fetchFromSupabase(): Promise<GuideData | null> {
  const supabase = getBuildSupabase();
  if (!supabase) return null;

  const directorySelect =
    "slug, name, types, area, description_short, description_long, tip, booking, is_salty_pick, is_new, website_url, social_url, tag_slugs, status";

  const { data: places, error } = await supabase
    .from("place_directory")
    .select(directorySelect)
    .eq("status", "published")
    .order("name");

  if (error || !places?.length) {
    const fallback = await supabase
      .from("places")
      .select(
        "slug, name, types, area, description_short, description_long, tip, booking, is_salty_pick, is_new, is_free, website_url, social_url, status",
      )
      .eq("status", "published")
      .order("name");

    if (fallback.error || !fallback.data?.length) return null;

    return {
      venues: fallback.data.map((row) => mapRowToVenue(row as Record<string, unknown>)),
      links: buildLinksFromRows(fallback.data as Record<string, unknown>[]),
      weekCount: WEEK_COUNT,
      teasers: TEASERS,
      soon: SOON,
    };
  }

  return {
    venues: places.map((row) => mapRowToVenue(row as Record<string, unknown>)),
    links: buildLinksFromRows(places as Record<string, unknown>[]),
    weekCount: WEEK_COUNT,
    teasers: TEASERS,
    soon: SOON,
  };
}

function fallbackData(): GuideData {
  return {
    venues: fallbackVenues as Venue[],
    links: fallbackLinks as Record<string, VenueLinks>,
    weekCount: WEEK_COUNT,
    teasers: TEASERS as Teaser[],
    soon: SOON as SoonItem[],
  };
}

export async function fetchGuideData(): Promise<GuideData> {
  try {
    const fromDb = await fetchFromSupabase();
    if (fromDb?.venues.length) {
      return fromDb;
    }
  } catch {
    // use prototype fallback
  }
  return fallbackData();
}
