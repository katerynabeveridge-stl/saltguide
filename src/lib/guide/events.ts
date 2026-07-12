import { pickCoverAlt, pickCoverUrl } from "./images";
import type { EventCat, FeedEvent } from "./types";

const TZ = "Europe/London";

type PlaceJoin = {
  name: string;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
};

export type EventRow = {
  slug: string;
  title: string;
  event_types: string[];
  starts_at: string;
  ends_at: string | null;
  description_short: string | null;
  description_long: string | null;
  venue_freetext: string | null;
  is_salty_pick: boolean;
  is_free: boolean | null;
  booking_url: string | null;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  price_label?: string | null;
  salt_says?: string | null;
  recurrence_label?: string | null;
  places: PlaceJoin | PlaceJoin[] | null;
};

const TYPE_TO_CAT: Record<string, EventCat> = {
  // Music & Nights Out — gigs, DJ sets, club nights, quizzes, karaoke
  music: "music",
  gig: "music",
  night: "music",
  late: "music",
  club: "music",
  dj: "music",
  quiz: "music",
  karaoke: "music",
  // Food & Drink
  food: "food",
  drink: "food",
  // Arts & Culture — exhibitions, film, theatre, comedy, stage & screen
  exhibition: "art",
  art: "art",
  culture: "art",
  film: "art",
  cinema: "art",
  comedy: "art",
  theatre: "art",
  perform: "art",
  stage: "art",
  // Markets & Fairs
  market: "market",
  fair: "market",
  // Workshops
  workshop: "workshop",
  kids: "workshop",
  // Outdoors & Wellbeing
  outdoors: "outdoors",
  wellbeing: "outdoors",
  wellness: "outdoors",
  sport: "outdoors",
  swim: "outdoors",
};

function londonParts(iso: string): {
  y: number;
  m: number;
  d: number;
  hour: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    y: get("year"),
    m: get("month"),
    d: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function toDateISO(iso: string): string {
  const { y, m, d } = londonParts(iso);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function hasMeaningfulTime(iso: string): boolean {
  const { hour, minute } = londonParts(iso);
  return !(hour === 0 && minute === 0);
}

function formatTimeShort(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })
    .format(new Date(iso))
    .toLowerCase()
    .replace(/\s/g, "");
}

function formatEventTime(startsAt: string, endsAt: string | null): string | undefined {
  const startHasTime = hasMeaningfulTime(startsAt);
  const endHasTime = endsAt ? hasMeaningfulTime(endsAt) : false;
  if (!startHasTime && !endHasTime) return undefined;

  const startTime = formatTimeShort(startsAt);
  if (!endsAt || !endHasTime) {
    return startHasTime ? startTime : undefined;
  }
  const endTime = formatTimeShort(endsAt);
  if (startTime === endTime) return startTime;
  return `${startTime}–${endTime}`;
}

function resolvePlace(row: EventRow): PlaceJoin | undefined {
  const places = row.places;
  if (!places) return undefined;
  return Array.isArray(places) ? places[0] : places;
}

function resolveVenue(row: EventRow): string | undefined {
  const place = resolvePlace(row);
  if (place?.name?.trim()) return place.name.trim();
  const free = row.venue_freetext?.trim();
  return free || undefined;
}

function resolveCat(types: string[]): EventCat {
  for (const t of types ?? []) {
    if (TYPE_TO_CAT[t]) return TYPE_TO_CAT[t];
  }
  return "art";
}

function mapRowToFeedEvent(row: EventRow): FeedEvent {
  const short = row.description_short?.trim() || undefined;
  const long = row.description_long?.trim() || undefined;
  const family = (row.event_types ?? []).some(
    (t) => t === "kids" || t === "family" || t === "send",
  );
  const place = resolvePlace(row);
  const title = row.title.trim();
  const imageUrl = pickCoverUrl(row.cover_image_url, place?.cover_image_url);
  const imageAlt = imageUrl
    ? pickCoverAlt(title, row.cover_image_alt, place?.cover_image_alt)
    : undefined;
  const price =
    row.price_label?.trim() ||
    (row.is_free ? "Free" : undefined);
  const saltSays = row.salt_says?.trim() || undefined;
  const recurs = row.recurrence_label?.trim() || undefined;

  return {
    slug: row.slug,
    dateISO: toDateISO(row.starts_at),
    title,
    venue: resolveVenue(row),
    time: formatEventTime(row.starts_at, row.ends_at),
    description: short || long,
    detail: long && long !== short ? long : undefined,
    cat: resolveCat(row.event_types ?? []),
    free: Boolean(row.is_free),
    pick: Boolean(row.is_salty_pick),
    family,
    bookingUrl: row.booking_url?.trim() || undefined,
    imageUrl,
    imageAlt,
    price,
    saltSays,
    recurs,
  };
}

export function mapEventsToFeed(rows: EventRow[]): FeedEvent[] | null {
  if (!rows.length) return null;
  return rows
    .map(mapRowToFeedEvent)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.title.localeCompare(b.title));
}

/** London calendar helpers for client filters. */
export function londonTodayISO(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "2026";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

export function addDaysISO(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

export function weekendISODates(now = new Date()): string[] {
  const today = londonTodayISO(now);
  const [y, m, d] = today.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 Sun
  // Next/current Sat–Sun in London sense: Friday-Sat-Sun featured weekend from next Fri if Mon–Thu
  // For filter "this weekend" use Sat + Sun of the upcoming or current weekend.
  let daysUntilSat: number;
  if (weekday === 6) daysUntilSat = 0;
  else if (weekday === 0) daysUntilSat = -1;
  else daysUntilSat = 6 - weekday;
  const sat = addDaysISO(today, daysUntilSat);
  const sun = addDaysISO(sat, 1);
  return [sat, sun];
}

export function longDayName(dateISO: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "long",
  }).format(new Date(`${dateISO}T12:00:00Z`));
}

export function shortDateLabel(dateISO: string): string {
  const day = longDayName(dateISO).slice(0, 3);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
  }).formatToParts(new Date(`${dateISO}T12:00:00Z`));
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  const mo = parts.find((p) => p.type === "month")?.value ?? "";
  return `${day} ${d} ${mo}`;
}

export function badgeDateLabel(dateISO: string, todayISO: string, tomorrowISO: string): string {
  if (dateISO === todayISO) return "TODAY";
  if (dateISO === tomorrowISO) return "TOMORROW";
  const day = longDayName(dateISO).slice(0, 3).toUpperCase();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
  }).formatToParts(new Date(`${dateISO}T12:00:00Z`));
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  const mo = (parts.find((p) => p.type === "month")?.value ?? "").toUpperCase();
  return `${day} ${d} ${mo}`;
}

export function eventBadgeLabel(
  event: Pick<FeedEvent, "dateISO" | "recurs">,
  todayISO: string,
  tomorrowISO: string,
): string {
  if (event.recurs) return `↻ ${event.recurs}`;
  return badgeDateLabel(event.dateISO, todayISO, tomorrowISO);
}
