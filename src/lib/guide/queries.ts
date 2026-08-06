import { mapEventsToFeed, type EventRow } from "./events";
import fallbackLinks from "./links.json";
import fallbackVenues from "./venues.json";
import { FALLBACK_EVENTS } from "./constants";
import type { FeedEvent, GuideData, Venue, VenueLinks } from "./types";
import { getBuildSupabase } from "../supabase/build";

/** New Saltguide project: places.place_type → app type slug. */
function placeTypeToSlug(value: unknown): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const slug = raw.toLowerCase().replace(/-/g, "_");
  const aliases: Record<string, string> = {
    play_cafe: "play_cafe",
    soft_play: "soft_play",
    cafe: "cafe",
  };
  return aliases[slug] ?? slug;
}

/** Normalize DB tags to the guide's Good-for / type keys. */
function normalizeTag(tag: string): string {
  const t = tag.trim().toLowerCase();
  const aliases: Record<string, string> = {
    "sea-view": "sea-views",
    "sunday-roast": "roast",
    "vegan-options": "vegan-friendly",
    "family-friendly": "child-friendly",
    "natural-wine": "wine",
    brunch: "breakfast",
    "play-cafe": "play_cafe",
    "soft-play": "soft_play",
    "send-friendly": "send",
  };
  return aliases[t] ?? t;
}

function titleCaseArea(area: string): string {
  return area
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function venueDescription(row: Record<string, unknown>): string {
  return row.summary ? String(row.summary).trim() : "";
}

function textArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .map(normalizeTag);
}

function coverUrlFromRow(row: Record<string, unknown>): string | undefined {
  for (const key of ["image_url", "cover_image_url", "photo_url"] as const) {
    const v = row[key];
    if (v) {
      const t = String(v).trim();
      if (t) return t;
    }
  }
  return undefined;
}

function mapRowToVenue(row: Record<string, unknown>): Venue {
  const typeSlug = placeTypeToSlug(row.place_type);
  const tags = textArray(row.tags);
  const types = new Set<string>();
  if (typeSlug) types.add(typeSlug);
  for (const t of tags) {
    // Tags that are also place types (restaurant, cafe, …)
    if (
      [
        "restaurant",
        "cafe",
        "bar",
        "pub",
        "bakery",
        "takeaway",
        "museum",
        "gallery",
        "cinema",
        "workshop",
        "gym",
        "park",
        "farm",
        "market",
        "soft_play",
        "play_cafe",
        "music_venue",
      ].includes(t)
    ) {
      types.add(t);
    }
  }

  const areaRaw = row.area ? String(row.area).trim() : "";

  return {
    slug: String(row.slug ?? ""),
    n: String(row.name ?? ""),
    types: [...types],
    a: areaRaw ? titleCaseArea(areaRaw) : "",
    tags,
    b: venueDescription(row),
    tip: null,
    booking: row.booking === "book-ahead" ? "book-ahead" : "walk-in",
    sp: false,
    isNew: Boolean(row.is_new),
    isFree: Boolean(row.is_free),
    coverImageUrl: coverUrlFromRow(row),
    coverImageAlt: undefined,
    galleryImageUrls: [],
    isFeatured: false,
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

const PLACES_SELECT =
  "slug, name, place_type, area, summary, booking, is_new, is_free, website_url, social_url, tags, image_url, show_on_saltguide";

const EVENTS_SELECT =
  "id, status, title, description, external_url, image_url, event_date, start_time, end_time, is_recurring, recurrence_pattern, recurrence_type, venue_name, place_name, is_free, price, type, theme_tags, vibe_tags, is_send_friendly, show_on_saltguide";

async function fetchEventsFromSupabase(
  supabase: NonNullable<ReturnType<typeof getBuildSupabase>>,
): Promise<FeedEvent[] | null> {
  const { data, error } = await supabase
    .from("events")
    .select(EVENTS_SELECT)
    .eq("show_on_saltguide", true)
    .eq("status", "approved")
    .order("event_date");

  if (error) {
    console.warn("[guide] events query failed:", error.message);
    return null;
  }
  if (!data?.length) {
    console.warn(
      "[guide] events: 0 rows with show_on_saltguide=true (approved)",
    );
    return [];
  }
  return mapEventsToFeed(data as unknown as EventRow[]) ?? [];
}

async function fetchPlacesFromSupabase(
  supabase: NonNullable<ReturnType<typeof getBuildSupabase>>,
): Promise<{ venues: Venue[]; links: Record<string, VenueLinks> } | null> {
  const { data, error } = await supabase
    .from("places")
    .select(PLACES_SELECT)
    .eq("show_on_saltguide", true)
    .order("name");

  if (error) {
    console.warn("[guide] places query failed:", error.message);
    return null;
  }
  if (!data?.length) {
    console.warn("[guide] places: 0 rows with show_on_saltguide=true");
    return null;
  }

  const rows = data as unknown as Record<string, unknown>[];
  return {
    venues: rows.map(mapRowToVenue).filter((v) => v.slug && v.n),
    links: buildLinksFromRows(rows),
  };
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

  const events = eventsResult ?? [];
  console.info(
    `[guide] supabase: ${placesResult.venues.length} places, ${events.length} events (show_on_saltguide)`,
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
