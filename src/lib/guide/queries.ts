import { FALLBACK_EVENTS } from "./constants";
import { mapEventsToFeed, type EventRow } from "./events";
import fallbackLinks from "./links.json";
import fallbackVenues from "./venues.json";
import type { FeedEvent, GuideData, Venue, VenueLinks } from "./types";
import { getBuildSupabase } from "../supabase/build";

function venueDescription(row: Record<string, unknown>): string {
  const long = row.description_long ? String(row.description_long).trim() : "";
  const short = row.description_short
    ? String(row.description_short).trim()
    : "";
  // Place cards show the full blurb — prefer long, fall back to short.
  if (long) return long;
  if (short) return short;
  return row.description ? String(row.description).trim() : "";
}

function textArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => String(v ?? "").trim())
    .filter(Boolean);
}

function coverUrlFromRow(row: Record<string, unknown>): string | undefined {
  for (const key of ["cover_image_url", "photo_url", "image_url"] as const) {
    const v = row[key];
    if (v) {
      const t = String(v).trim();
      if (t) return t;
    }
  }
  return undefined;
}

function coverAltFromRow(row: Record<string, unknown>): string | undefined {
  for (const key of ["cover_image_alt", "photo_alt", "image_alt"] as const) {
    const v = row[key];
    if (v) {
      const t = String(v).trim();
      if (t) return t;
    }
  }
  return undefined;
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
    coverImageUrl: coverUrlFromRow(row),
    coverImageAlt: coverAltFromRow(row),
    galleryImageUrls: textArray(row.gallery_image_urls),
    isFeatured: Boolean(row.is_featured),
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
      entry.ig = social
        .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
        .replace(/\/$/, "");
    }
    if (entry.w || entry.ig) links[slug] = entry;
  }
  return links;
}

// Live schema uses id + image_url (no slug / event_types / cover_* yet).
// Optional richer columns are tried first, then we peel back so missing
// migrations never wipe the whole feed.
const EVENT_SELECTS = [
  "id, slug, title, event_types, starts_at, ends_at, description_short, description_long, venue_freetext, is_salty_pick, is_free, booking_url, image_url, cover_image_url, cover_image_alt, price_label, recurrence_label, status, places(name, photo_url, cover_image_url, cover_image_alt)",
  "id, title, starts_at, ends_at, description_short, description_long, venue_freetext, is_salty_pick, is_free, booking_url, image_url, price_label, recurrence_label, status, places(name, photo_url)",
  "id, title, starts_at, ends_at, description_short, description_long, venue_freetext, is_salty_pick, is_free, booking_url, image_url, status, places(name, photo_url)",
  "id, title, starts_at, ends_at, description_short, description_long, venue_freetext, is_salty_pick, is_free, booking_url, image_url, status",
];

async function fetchEventsFromSupabase(
  supabase: NonNullable<ReturnType<typeof getBuildSupabase>>,
): Promise<FeedEvent[] | null> {
  for (const select of EVENT_SELECTS) {
    const { data, error } = await supabase
      .from("events")
      .select(select)
      .eq("status", "published")
      .order("starts_at");

    if (error || !data?.length) continue;
    const mapped = mapEventsToFeed(data as unknown as EventRow[]);
    if (mapped?.length) return mapped;
  }

  // Fall through for empty-table logging below.

  const lastSelect = EVENT_SELECTS[EVENT_SELECTS.length - 1];
  const last = await supabase
    .from("events")
    .select(lastSelect)
    .eq("status", "published")
    .order("starts_at");

  if (last.error) {
    console.warn("[guide] events query failed:", last.error.message);
    return null;
  }
  if (!last.data?.length) {
    console.warn("[guide] events: 0 published rows — using fallback feed");
    return null;
  }
  return mapEventsToFeed(last.data as unknown as EventRow[]);
}

const PLACE_DIRECTORY_SELECTS = [
  "slug, name, types, area, description_short, description_long, tip, booking, is_salty_pick, is_new, website_url, social_url, tag_slugs, photo_url, cover_image_url, cover_image_alt, gallery_image_urls, is_featured, status",
  "slug, name, types, area, description_short, description_long, tip, booking, is_salty_pick, is_new, website_url, social_url, tag_slugs, photo_url, cover_image_url, cover_image_alt, status",
  "slug, name, types, area, description_short, description_long, tip, booking, is_salty_pick, is_new, website_url, social_url, tag_slugs, photo_url, status",
];

const PLACES_SELECTS = [
  "slug, name, types, area, description_short, description_long, tip, booking, is_salty_pick, is_new, is_free, website_url, social_url, photo_url, cover_image_url, cover_image_alt, gallery_image_urls, is_featured, status",
  "slug, name, types, area, description_short, description_long, tip, booking, is_salty_pick, is_new, is_free, website_url, social_url, photo_url, cover_image_url, cover_image_alt, status",
  "slug, name, types, area, description_short, description_long, tip, booking, is_salty_pick, is_new, is_free, website_url, social_url, photo_url, status",
];

async function fetchPlacesFromSupabase(
  supabase: NonNullable<ReturnType<typeof getBuildSupabase>>,
): Promise<{ venues: Venue[]; links: Record<string, VenueLinks> } | null> {
  const mapRows = (rows: Record<string, unknown>[]) => ({
    venues: rows.map(mapRowToVenue),
    links: buildLinksFromRows(rows),
  });

  for (const select of PLACE_DIRECTORY_SELECTS) {
    const { data, error } = await supabase
      .from("place_directory")
      .select(select)
      .eq("status", "published")
      .order("name");

    if (!error && data?.length) {
      return mapRows(data as unknown as Record<string, unknown>[]);
    }
  }

  for (const select of PLACES_SELECTS) {
    const { data, error } = await supabase
      .from("places")
      .select(select)
      .eq("status", "published")
      .order("name");

    if (!error && data?.length) {
      return mapRows(data as unknown as Record<string, unknown>[]);
    }
  }

  console.warn("[guide] places query returned no rows");
  return null;
}

async function fetchFromSupabase(): Promise<GuideData | null> {
  const supabase = getBuildSupabase();
  if (!supabase) {
    console.warn(
      "[guide] missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
    return null;
  }

  const [placesResult, eventsResult] = await Promise.all([
    fetchPlacesFromSupabase(supabase),
    fetchEventsFromSupabase(supabase),
  ]);

  if (!placesResult?.venues.length) {
    return null;
  }

  const events = eventsResult?.length ? eventsResult : FALLBACK_EVENTS;
  console.info(
    `[guide] supabase: ${placesResult.venues.length} places, ${
      eventsResult?.length ?? 0
    } events` +
      (eventsResult?.length ? "" : " (events using static fallback)"),
  );

  return {
    venues: placesResult.venues,
    links: placesResult.links,
    events,
  };
}

function fallbackData(): GuideData {
  console.warn("[guide] using static venues.json + FALLBACK_EVENTS");
  return {
    venues: fallbackVenues as Venue[],
    links: fallbackLinks as Record<string, VenueLinks>,
    events: FALLBACK_EVENTS,
  };
}

export async function fetchGuideData(): Promise<GuideData> {
  try {
    const fromDb = await fetchFromSupabase();
    if (fromDb?.venues.length) {
      return fromDb;
    }
  } catch (err) {
    console.warn(
      "[guide] supabase fetch threw:",
      err instanceof Error ? err.message : err,
    );
  }
  return fallbackData();
}
