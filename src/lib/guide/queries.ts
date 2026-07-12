import { FALLBACK_EVENTS } from "./constants";
import { mapEventsToFeed, type EventRow } from "./events";
import fallbackLinks from "./links.json";
import fallbackVenues from "./venues.json";
import type { FeedEvent, GuideData, Venue, VenueLinks } from "./types";
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
    coverImageUrl: row.cover_image_url
      ? String(row.cover_image_url).trim() || undefined
      : undefined,
    coverImageAlt: row.cover_image_alt
      ? String(row.cover_image_alt).trim() || undefined
      : undefined,
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

const EVENT_SELECT_BASE =
  "slug, title, event_types, starts_at, ends_at, description_short, description_long, venue_freetext, is_salty_pick, is_free, booking_url, cover_image_url, cover_image_alt, status, places(name, cover_image_url, cover_image_alt)";

// Optional editorial columns added by supabase/event_editorial.sql. Selected
// separately so the whole feed doesn't fail before that migration is run.
const EVENT_SELECT_EDITORIAL = `${EVENT_SELECT_BASE}, price_label, salt_says, recurrence_label`;

async function fetchEventsFromSupabase(
  supabase: NonNullable<ReturnType<typeof getBuildSupabase>>,
): Promise<FeedEvent[] | null> {
  const withEditorial = await supabase
    .from("events")
    .select(EVENT_SELECT_EDITORIAL)
    .eq("status", "published")
    .order("starts_at");

  if (!withEditorial.error && withEditorial.data?.length) {
    return mapEventsToFeed(withEditorial.data as EventRow[]);
  }

  // Editorial columns may not exist yet — retry with the base columns so real
  // events (venue, time, free/paid) still load.
  const base = await supabase
    .from("events")
    .select(EVENT_SELECT_BASE)
    .eq("status", "published")
    .order("starts_at");

  if (base.error || !base.data?.length) return null;

  return mapEventsToFeed(base.data as EventRow[]);
}

async function fetchPlacesFromSupabase(
  supabase: NonNullable<ReturnType<typeof getBuildSupabase>>,
): Promise<{ venues: Venue[]; links: Record<string, VenueLinks> } | null> {
  const directorySelect =
    "slug, name, types, area, description_short, description_long, tip, booking, is_salty_pick, is_new, website_url, social_url, tag_slugs, cover_image_url, cover_image_alt, status";

  const { data: places, error } = await supabase
    .from("place_directory")
    .select(directorySelect)
    .eq("status", "published")
    .order("name");

  if (error || !places?.length) {
    const fallback = await supabase
      .from("places")
      .select(
        "slug, name, types, area, description_short, description_long, tip, booking, is_salty_pick, is_new, is_free, website_url, social_url, cover_image_url, cover_image_alt, status",
      )
      .eq("status", "published")
      .order("name");

    if (fallback.error || !fallback.data?.length) return null;

    return {
      venues: fallback.data.map((row) =>
        mapRowToVenue(row as Record<string, unknown>),
      ),
      links: buildLinksFromRows(fallback.data as Record<string, unknown>[]),
    };
  }

  return {
    venues: places.map((row) => mapRowToVenue(row as Record<string, unknown>)),
    links: buildLinksFromRows(places as Record<string, unknown>[]),
  };
}

async function fetchFromSupabase(): Promise<GuideData | null> {
  const supabase = getBuildSupabase();
  if (!supabase) return null;

  const [placesResult, eventsResult] = await Promise.all([
    fetchPlacesFromSupabase(supabase),
    fetchEventsFromSupabase(supabase),
  ]);

  if (!placesResult?.venues.length) {
    return null;
  }

  return {
    venues: placesResult.venues,
    links: placesResult.links,
    events: eventsResult?.length ? eventsResult : FALLBACK_EVENTS,
  };
}

function fallbackData(): GuideData {
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
  } catch {
    // use prototype fallback
  }
  return fallbackData();
}
