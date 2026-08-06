import { pickCoverAlt, pickCoverUrl } from "./images";
import type { EventCat, FeedEvent } from "./types";

const TZ = "Europe/London";

export type EventRow = {
  id?: string | number;
  title: string;
  description?: string | null;
  external_url?: string | null;
  image_url?: string | null;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  is_recurring?: boolean | null;
  recurrence_pattern?: string | null;
  recurrence_type?: string | null;
  venue_name?: string | null;
  place_name?: string | null;
  is_free?: boolean | null;
  price?: number | string | null;
  type?: string | null;
  theme_tags?: string[] | null;
  vibe_tags?: string[] | null;
  is_send_friendly?: boolean | null;
  show_on_saltguide?: boolean | null;
  status?: string | null;
};

const TYPE_TO_CAT: Record<string, EventCat> = {
  // Music & Nights Out
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
  tasting: "food",
  // Arts & Culture
  exhibition: "art",
  art: "art",
  culture: "art",
  film: "art",
  cinema: "art",
  comedy: "art",
  theatre: "art",
  perform: "art",
  stage: "art",
  event: "art",
  // Markets & Fairs
  market: "market",
  fair: "market",
  // Workshops / classes
  workshop: "workshop",
  class: "workshop",
  kids: "workshop",
  // Outdoors & Wellbeing
  outdoors: "outdoors",
  wellbeing: "outdoors",
  wellness: "outdoors",
  sport: "outdoors",
  swim: "outdoors",
};

function clockToLabel(clock: string): string {
  const [hStr, mStr] = clock.split(":");
  let h = Number(hStr);
  const m = Number(mStr) || 0;
  const suffix = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  return m === 0 ? `${h}${suffix}` : `${h}:${String(m).padStart(2, "0")}${suffix}`;
}

function formatClockRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string | undefined {
  const s = start?.trim();
  const e = end?.trim();
  if (!s && !e) return undefined;
  if (s && e) {
    const a = clockToLabel(s);
    const b = clockToLabel(e);
    return a === b ? a : `${a}–${b}`;
  }
  if (s) return clockToLabel(s);
  return e ? clockToLabel(e) : undefined;
}

function resolveVenue(row: EventRow): string | undefined {
  const place = row.place_name?.trim();
  if (place) return place;
  const venue = row.venue_name?.trim();
  return venue || undefined;
}

function resolveCat(row: EventRow): EventCat {
  const tokens = [
    row.type,
    ...(row.theme_tags ?? []),
    ...(row.vibe_tags ?? []),
  ]
    .filter(Boolean)
    .map((t) => String(t).toLowerCase().trim());

  for (const t of tokens) {
    if (TYPE_TO_CAT[t]) return TYPE_TO_CAT[t];
    for (const [key, cat] of Object.entries(TYPE_TO_CAT)) {
      if (t.includes(key)) return cat;
    }
  }
  return "art";
}

function formatPrice(row: EventRow): string | undefined {
  if (row.is_free) return "Free";
  if (row.price == null || row.price === "") return undefined;
  const n = typeof row.price === "number" ? row.price : Number(row.price);
  if (!Number.isFinite(n)) return String(row.price);
  if (n === 0) return "Free";
  return Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`;
}

function formatRecurs(row: EventRow): string | undefined {
  if (!row.is_recurring) return undefined;
  const raw =
    row.recurrence_pattern?.trim() || row.recurrence_type?.trim() || "";
  if (!raw) return "RECURRING";
  return raw.replace(/[_-]+/g, " ").toUpperCase();
}

function eventSlug(row: EventRow): string {
  if (row.id != null) return String(row.id);
  const date = row.event_date?.slice(0, 10) || "undated";
  return `event-${date}-${row.title.trim().toLowerCase().replace(/\s+/g, "-")}`;
}

function mapRowToFeedEvent(row: EventRow): FeedEvent {
  const title = row.title.trim();
  const description = row.description?.trim() || undefined;
  const imageUrl = pickCoverUrl(row.image_url);
  const family =
    Boolean(row.is_send_friendly) ||
    (row.theme_tags ?? []).some((t) =>
      /kids|family|send|child/i.test(String(t)),
    ) ||
    row.type === "class";

  return {
    slug: eventSlug(row),
    dateISO: String(row.event_date).slice(0, 10),
    title,
    venue: resolveVenue(row),
    time: formatClockRange(row.start_time, row.end_time),
    description,
    detail: undefined,
    cat: resolveCat(row),
    free: Boolean(row.is_free),
    pick: false,
    family,
    bookingUrl: row.external_url?.trim() || undefined,
    imageUrl,
    imageAlt: imageUrl ? pickCoverAlt(title) : undefined,
    price: formatPrice(row),
    recurs: formatRecurs(row),
  };
}

export function mapEventsToFeed(rows: EventRow[]): FeedEvent[] | null {
  if (!rows.length) return null;
  return rows
    .map(mapRowToFeedEvent)
    .sort(
      (a, b) =>
        a.dateISO.localeCompare(b.dateISO) || a.title.localeCompare(b.title),
    );
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

/** Home highlights: today if any events, else nearest upcoming day, top N. */
export function homeHighlightEvents(
  events: FeedEvent[],
  todayISO: string,
  limit = 4,
): { dayISO: string; events: FeedEvent[] } | null {
  const upcoming = events
    .filter((e) => e.dateISO >= todayISO)
    .sort(
      (a, b) =>
        a.dateISO.localeCompare(b.dateISO) || a.title.localeCompare(b.title),
    );

  if (!upcoming.length) return null;

  const targetDay = upcoming.some((e) => e.dateISO === todayISO)
    ? todayISO
    : upcoming[0].dateISO;

  const dayEvents = upcoming
    .filter((e) => e.dateISO === targetDay)
    .sort((a, b) => {
      if (a.pick !== b.pick) return a.pick ? -1 : 1;
      return a.title.localeCompare(b.title);
    })
    .slice(0, limit);

  return dayEvents.length ? { dayISO: targetDay, events: dayEvents } : null;
}

/** Home carousel: salty picks first, then fill with upcoming events. */
export function homeWeekPicks(
  events: FeedEvent[],
  todayISO: string,
  limit = 3,
): FeedEvent[] {
  const upcoming = events
    .filter((e) => e.dateISO >= todayISO)
    .sort(
      (a, b) =>
        a.dateISO.localeCompare(b.dateISO) || a.title.localeCompare(b.title),
    );

  const picks = upcoming.filter((e) => e.pick);
  const rest = upcoming.filter((e) => !e.pick);
  return [...picks, ...rest].slice(0, limit);
}

/** Compact “also on this week” strip — next 7 days, excluding carousel slugs. */
export function homeWeekStrip(
  events: FeedEvent[],
  todayISO: string,
  excludeSlugs: Set<string>,
  limit = 5,
): FeedEvent[] {
  const endISO = addDaysISO(todayISO, 6);
  return events
    .filter(
      (e) =>
        e.dateISO >= todayISO &&
        e.dateISO <= endISO &&
        !excludeSlugs.has(e.slug),
    )
    .sort(
      (a, b) =>
        a.dateISO.localeCompare(b.dateISO) || a.title.localeCompare(b.title),
    )
    .slice(0, limit);
}

/** Short date for home cards, e.g. "Fri 31 Jul". */
export function shortWeekdayDate(dateISO: string): string {
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

export function homeHighlightsSubline(
  dayISO: string,
  todayISO: string,
  tomorrowISO: string,
): string {
  if (dayISO === todayISO) return "What's on today.";
  if (dayISO === tomorrowISO) return "What's on tomorrow.";
  const day = longDayName(dayISO);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
  }).formatToParts(new Date(`${dayISO}T12:00:00Z`));
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  const mo = parts.find((p) => p.type === "month")?.value ?? "";
  return `What's on ${day} ${d} ${mo}.`;
}
