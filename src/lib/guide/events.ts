import {
  EVENT_CATS,
  EVENT_CAT_TO_SALTGUIDE,
  eventCatFromSaltguide,
} from "./constants";
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
  /** Inclusive span end when the listing is a date range (not weekly forever). */
  recurrence_end_date?: string | null;
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
  is_top_event?: boolean | null;
  show_on_saltguide?: boolean | null;
  show_on_pebbles?: boolean | null;
  saltguide_category?: string | null;
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
  const pattern = row.recurrence_pattern?.trim();
  const type = row.recurrence_type?.trim();
  const raw =
    pattern || (type && type.toLowerCase() !== "none" ? type : "") || "";
  if (!raw) return "RECURRING";
  return raw.replace(/[_-]+/g, " ").toUpperCase();
}

function eventSlug(row: EventRow): string {
  if (row.id != null) return String(row.id);
  const date = row.event_date?.slice(0, 10) || "undated";
  return `event-${date}-${row.title.trim().toLowerCase().replace(/\s+/g, "-")}`;
}

function sliceISODate(value: string | null | undefined): string | undefined {
  const iso = value?.slice(0, 10);
  return iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : undefined;
}

/** Weekly / monthly / term-time — not a consecutive-day span. */
function isPeriodicRecurrence(recurs: string | undefined): boolean {
  return Boolean(recurs && /WEEKLY|MONTHLY|TERM/.test(recurs));
}

function isoDayDiff(startISO: string, endISO: string): number {
  const [y1, m1, d1] = startISO.split("-").map(Number);
  const [y2, m2, d2] = endISO.split("-").map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.round((b - a) / 86400000);
}

/** Start → end inclusive day count when this is a real consecutive span. */
function consecutiveSpanDays(
  event: Pick<FeedEvent, "dateISO" | "endISO" | "recurs">,
): number | null {
  if (!event.endISO || event.endISO <= event.dateISO) return null;
  if (isPeriodicRecurrence(event.recurs)) return null;
  return isoDayDiff(event.dateISO, event.endISO) + 1;
}

function dayMonthUpper(dateISO: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
  }).formatToParts(new Date(`${dateISO}T12:00:00Z`));
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  const mo = (parts.find((p) => p.type === "month")?.value ?? "").toUpperCase();
  return `${d} ${mo}`;
}

function weekdayUpper(dateISO: string): string {
  return longDayName(dateISO).slice(0, 3).toUpperCase();
}

export function eventCoversDate(
  event: Pick<FeedEvent, "dateISO" | "endISO" | "recurs">,
  dateISO: string,
): boolean {
  const span = consecutiveSpanDays(event);
  if (span && span >= 2 && event.endISO) {
    return event.dateISO <= dateISO && event.endISO >= dateISO;
  }
  return event.dateISO === dateISO;
}

export function eventIsUpcoming(
  event: Pick<FeedEvent, "dateISO" | "endISO" | "recurs">,
  todayISO: string,
): boolean {
  const span = consecutiveSpanDays(event);
  if (span && span >= 2 && event.endISO) {
    return event.endISO >= todayISO;
  }
  return event.dateISO >= todayISO;
}

export function isExhibitionEvent(
  event: Pick<FeedEvent, "type"> | Pick<EventRow, "type">,
): boolean {
  return String(event.type ?? "")
    .trim()
    .toLowerCase() === "exhibition";
}

const FESTIVAL_RE = /festival/i;

/** Festival if DB type is `festival`, or /festival/i appears in type or title. */
export function isFestivalEvent(
  event: Pick<FeedEvent, "type" | "title"> | Pick<EventRow, "type" | "title">,
): boolean {
  const type = String(event.type ?? "");
  const title = String(event.title ?? "");
  return (
    type.trim().toLowerCase() === "festival" ||
    FESTIVAL_RE.test(type) ||
    FESTIVAL_RE.test(title)
  );
}

/** What's On first section: exhibitions or festivals (no extra DB column). */
export function isExhibitionOrFestivalEvent(
  event: Pick<FeedEvent, "type" | "title"> | Pick<EventRow, "type" | "title">,
): boolean {
  return isExhibitionEvent(event) || isFestivalEvent(event);
}

/** Exhibitions first, then by date, then title. Used on home, not the What's On stack. */
export function compareFeedEvents(a: FeedEvent, b: FeedEvent): number {
  const aEx = isExhibitionEvent(a);
  const bEx = isExhibitionEvent(b);
  if (aEx !== bEx) return aEx ? -1 : 1;
  return compareFeedEventsByDate(a, b);
}

/** Date then title — What's On list order (exhibitions/festivals are pulled into the first section). */
export function compareFeedEventsByDate(a: FeedEvent, b: FeedEvent): number {
  return (
    a.dateISO.localeCompare(b.dateISO) || a.title.localeCompare(b.title)
  );
}

/**
 * Card tint/icon + whether to show the category chip.
 * Colour follows `saltguide_category` when known so the pill matches the label;
 * otherwise keep the type/tag heuristic for tint only (no badge).
 */
export function eventCardStyle(
  event: Pick<FeedEvent, "cat" | "saltguideCategory">,
): {
  visual: (typeof EVENT_CATS)[string];
  showCategoryBadge: boolean;
} {
  const fromDb = eventCatFromSaltguide(event.saltguideCategory);
  const visual = EVENT_CATS[fromDb ?? event.cat] ?? EVENT_CATS.art;
  return { visual, showCategoryBadge: fromDb != null };
}

function mapRowToFeedEvent(row: EventRow): FeedEvent {
  const title = row.title.trim();
  const description = row.description?.trim() || undefined;
  const imageUrl = pickCoverUrl(row.image_url);
  const family = Boolean(row.is_send_friendly);
  const saltguideCategory = row.saltguide_category?.trim() || null;
  const dateISO = String(row.event_date).slice(0, 10);
  const endISO = sliceISODate(row.recurrence_end_date);
  const recurs = formatRecurs(row);

  return {
    slug: eventSlug(row),
    dateISO,
    endISO: endISO && endISO > dateISO ? endISO : undefined,
    title,
    venue: resolveVenue(row),
    time: formatClockRange(row.start_time, row.end_time),
    description,
    detail: undefined,
    type: row.type?.trim() || null,
    cat: resolveCat(row),
    saltguideCategory,
    free: Boolean(row.is_free),
    pick: false,
    top: Boolean(row.is_top_event),
    family,
    pebbles: Boolean(row.show_on_pebbles),
    bookingUrl: row.external_url?.trim() || undefined,
    imageUrl,
    imageAlt: imageUrl ? pickCoverAlt(title) : undefined,
    price: formatPrice(row),
    recurs,
  };
}

/**
 * What's On type/family/free filters.
 * Categories OR together; Family (`show_on_pebbles`) and Free (`is_free`) AND with that.
 * Empty / all-six category selection applies no category constraint (NULL categories stay visible).
 */
export function matchesWhatsOnKind(
  event: Pick<FeedEvent, "saltguideCategory" | "pebbles" | "free">,
  selectedCats: Set<EventCat>,
  allTypesSelected: boolean,
  familyOnly: boolean,
  freeOnly: boolean,
): boolean {
  if (!allTypesSelected) {
    const allowed = new Set(
      [...selectedCats].map((cat) => EVENT_CAT_TO_SALTGUIDE[cat]),
    );
    if (
      !event.saltguideCategory ||
      !allowed.has(event.saltguideCategory)
    ) {
      return false;
    }
  }
  if (familyOnly && !event.pebbles) return false;
  if (freeOnly && !event.free) return false;
  return true;
}

export function mapEventsToFeed(rows: EventRow[]): FeedEvent[] | null {
  if (!rows.length) return null;
  return rows.map(mapRowToFeedEvent).sort(compareFeedEvents);
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
  event: Pick<FeedEvent, "dateISO" | "endISO" | "recurs">,
  todayISO: string,
  tomorrowISO: string,
): string {
  const span = consecutiveSpanDays(event);
  if (span && span > 2 && event.endISO) {
    return `${dayMonthUpper(event.dateISO)} TO ${dayMonthUpper(event.endISO)}`;
  }
  if (span === 2 && event.endISO) {
    return `${weekdayUpper(event.dateISO)} AND ${weekdayUpper(event.endISO)}`;
  }
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
    .filter((e) => eventIsUpcoming(e, todayISO))
    .sort(compareFeedEvents);

  if (!upcoming.length) return null;

  const targetDay = upcoming.some((e) => e.dateISO === todayISO)
    ? todayISO
    : upcoming[0].dateISO;

  const dayEvents = upcoming
    .filter((e) => e.dateISO === targetDay)
    .sort((a, b) => {
      const aEx = isExhibitionEvent(a);
      const bEx = isExhibitionEvent(b);
      if (aEx !== bEx) return aEx ? -1 : 1;
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
    .filter((e) => eventIsUpcoming(e, todayISO))
    .sort(compareFeedEvents);

  const picks = upcoming.filter((e) => e.pick);
  const rest = upcoming.filter((e) => !e.pick);
  return [...picks, ...rest].slice(0, limit);
}

/**
 * Home "Top events coming up": events flagged is_top_event, upcoming only,
 * soonest first, capped at `limit`. Past events are excluded.
 */
export function homeTopEvents(
  events: FeedEvent[],
  todayISO: string,
  limit = 5,
): FeedEvent[] {
  return events
    .filter((e) => e.top && eventIsUpcoming(e, todayISO))
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

/**
 * Home “Also coming up” strip — upcoming Saltguide events, soonest first,
 * excluding slugs already shown in Top events. No week or category window.
 */
export function homeWeekStrip(
  events: FeedEvent[],
  todayISO: string,
  excludeSlugs: Set<string>,
  limit = 8,
): FeedEvent[] {
  return events
    .filter((e) => eventIsUpcoming(e, todayISO) && !excludeSlugs.has(e.slug))
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.title.localeCompare(b.title))
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
