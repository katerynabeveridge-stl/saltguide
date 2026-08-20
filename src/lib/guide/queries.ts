import type { SupabaseClient } from "@supabase/supabase-js";
import { mapEventsToFeed, londonTodayISO, type EventRow } from "./events";
import { pickCoverUrl } from "./images";
import fallbackLinks from "./links.json";
import fallbackVenues from "./venues.json";
import { FALLBACK_EVENTS } from "./constants";
import type { FeedEvent, GuideData, Venue, VenueLinks } from "./types";

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
  return pickCoverUrl(
    typeof row.image_url === "string" ? row.image_url : null,
    typeof row.cover_image_url === "string" ? row.cover_image_url : null,
    typeof row.photo_url === "string" ? row.photo_url : null,
  );
}

export function mapRowToVenue(row: Record<string, unknown>): Venue {
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
  "id, status, title, description, external_url, image_url, event_date, recurrence_end_date, start_time, end_time, is_recurring, recurrence_pattern, recurrence_type, venue_name, place_name, is_free, price, type, theme_tags, vibe_tags, is_send_friendly, is_top_event, show_on_pebbles, show_on_saltguide, saltguide_category";

/** Columns that may not exist yet on older deploys. */
const OPTIONAL_EVENT_COLUMNS = [
  "recurrence_end_date",
  "is_top_event",
  "saltguide_category",
] as const;

function withoutSelectColumn(select: string, column: string): string {
  return select
    .split(", ")
    .filter((part) => part !== column)
    .join(", ");
}

function isMissingColumnError(
  error: { code?: string; message?: string },
  column: string,
): boolean {
  const message = error.message ?? "";
  if (!message.includes(column)) return false;
  return error.code === "42703" || /does not exist/i.test(message);
}

async function fetchEventsFromSupabase(
  supabase: SupabaseClient,
): Promise<FeedEvent[] | null> {
  const todayISO = londonTodayISO();
  const query = (select: string, useEndDate: boolean) => {
    const q = supabase
      .from("events")
      .select(select)
      .eq("show_on_saltguide", true)
      .eq("status", "approved");
    const filtered = useEndDate
      ? q.or(
          `event_date.gte.${todayISO},recurrence_end_date.gte.${todayISO}`,
        )
      : q.gte("event_date", todayISO);
    return filtered.order("event_date");
  };

  let select = EVENTS_SELECT;
  let useEndDate = select.split(", ").includes("recurrence_end_date");
  let { data, error } = await query(select, useEndDate);
  while (error) {
    const currentError = error;
    const missing = OPTIONAL_EVENT_COLUMNS.find(
      (column) =>
        isMissingColumnError(currentError, column) &&
        (select.split(", ").includes(column) ||
          (column === "recurrence_end_date" && useEndDate)),
    );
    if (!missing) break;
    console.warn(
      `[guide] events.${missing} missing; retrying without that column`,
    );
    select = withoutSelectColumn(select, missing);
    if (missing === "recurrence_end_date") useEndDate = false;
    ({ data, error } = await query(select, useEndDate));
  }

  if (error) {
    console.warn("[guide] events query failed:", error.message);
    return null;
  }
  if (!data?.length) {
    console.warn(
      `[guide] events: 0 upcoming approved rows (show_on_saltguide, from ${todayISO})`,
    );
    return [];
  }
  return mapEventsToFeed(data as unknown as EventRow[]) ?? [];
}

async function fetchPlacesFromSupabase(
  supabase: SupabaseClient,
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

async function fetchFromSupabase(
  supabase: SupabaseClient,
): Promise<GuideData | null> {
  const [placesResult, eventsResult] = await Promise.all([
    fetchPlacesFromSupabase(supabase),
    fetchEventsFromSupabase(supabase),
  ]);

  if (!placesResult?.venues.length) {
    return null;
  }

  const events = eventsResult ?? [];
  console.info(
    `[guide] supabase: ${placesResult.venues.length} places, ${events.length} events (saltguide, upcoming)`,
  );

  return {
    venues: placesResult.venues,
    links: placesResult.links,
    events,
  };
}

export const EMPTY_GUIDE_DATA: GuideData = {
  venues: [],
  links: {},
  events: [],
};

export function fallbackGuideData(): GuideData {
  console.warn("[guide] using static venues.json + FALLBACK_EVENTS");
  return {
    venues: fallbackVenues as Venue[],
    links: fallbackLinks as Record<string, VenueLinks>,
    events: FALLBACK_EVENTS,
  };
}

export async function fetchGuideData(
  supabase: SupabaseClient | null,
): Promise<GuideData> {
  if (!supabase) {
    console.error(
      "[guide] missing or invalid NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY at build time — listings and photos will be the static fallback. Set the full https URL and full anon JWT as Cloudflare Pages Build variables (Production and Preview), then rebuild.",
    );
    return fallbackGuideData();
  }

  try {
    const fromDb = await fetchFromSupabase(supabase);
    if (fromDb?.venues.length) {
      return fromDb;
    }
    console.error(
      "[guide] supabase returned no saltguide places; using static fallback (no photos)",
    );
  } catch (err) {
    console.error(
      "[guide] supabase fetch threw:",
      err instanceof Error ? err.message : err,
    );
  }
  return fallbackGuideData();
}
