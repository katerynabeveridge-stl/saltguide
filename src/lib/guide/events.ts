import type { SoonItem, Teaser } from "./types";

const TZ = "Europe/London";

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
  places: { name: string } | { name: string }[] | null;
};

export type WhatsOnData = {
  weekCount: string;
  teasers: Teaser[];
  soon: SoonItem[];
};

const CHIP_LABELS: Record<string, string> = {
  late: "Late",
  "free-entry": "Free entry",
  free: "Free",
  family: "Family",
  outdoors: "Outdoors",
  culture: "Culture",
  booking: "Booking",
  new: "New",
  food: "Food",
  music: "Music",
  sport: "Sport",
  kids: "Kids",
  send: "SEND friendly",
};

function humanizeType(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function londonDate(iso: string): Date {
  return new Date(iso);
}

function startOfDayLondon(d: Date): Date {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value) - 1;
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return new Date(Date.UTC(y, m, day, 0, 0, 0, 0));
}

function weekdayLondon(d: Date): number {
  const name = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
  }).format(d);
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
  };
  return map[name] ?? 0;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function featuredWeekendRange(now = new Date()): { start: Date; end: Date } {
  const today = startOfDayLondon(now);
  const dow = weekdayLondon(now);
  let daysUntilFriday: number;
  if (dow === 0) {
    daysUntilFriday = -2;
  } else if (dow === 6) {
    daysUntilFriday = -1;
  } else if (dow === 5) {
    daysUntilFriday = 0;
  } else {
    daysUntilFriday = 5 - dow;
  }
  const friday = addDays(today, daysUntilFriday);
  const sunday = addDays(friday, 2);
  sunday.setUTCHours(23, 59, 59, 999);
  return { start: friday, end: sunday };
}

function currentWeekRange(now = new Date()): { start: Date; end: Date } {
  const today = startOfDayLondon(now);
  const dow = weekdayLondon(now);
  const daysFromMonday = dow === 0 ? 6 : dow - 1;
  const monday = addDays(today, -daysFromMonday);
  const sunday = addDays(monday, 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function inRange(iso: string, start: Date, end: Date): boolean {
  const t = londonDate(iso).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function formatDayLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
  }).format(londonDate(iso));
}

function formatSoonLabel(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
  }).formatToParts(londonDate(iso));
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${month} ${day}`;
}

function teaserBody(row: EventRow): string {
  const desc =
    row.description_short?.trim() ||
    row.description_long?.trim() ||
    "";
  const title = row.title.trim();
  if (!desc) return `<b>${title}</b>`;
  if (desc.startsWith("<")) return desc;
  return `<b>${title}</b> ${desc}`;
}

function buildChips(row: EventRow, markHot: boolean): Teaser["chips"] {
  const chips: NonNullable<Teaser["chips"]> = [];
  const seen = new Set<string>();

  for (const type of row.event_types ?? []) {
    const label = CHIP_LABELS[type] ?? humanizeType(type);
    if (seen.has(label)) continue;
    seen.add(label);
    chips.push({
      x: label,
      hot: markHot && chips.length === 0 && row.is_salty_pick,
    });
  }

  if (row.is_free && !seen.has("Free")) {
    chips.push({ x: "Free" });
  }
  if (row.booking_url && !seen.has("Booking")) {
    chips.push({ x: "Booking" });
  }
  if (row.is_salty_pick && chips.length === 0) {
    chips.push({ x: "Salt pick", hot: markHot });
  }

  return chips.length ? chips : undefined;
}

export function mapEventsToWhatsOn(rows: EventRow[]): WhatsOnData | null {
  if (!rows.length) return null;

  const now = new Date();
  const week = currentWeekRange(now);
  const weekend = featuredWeekendRange(now);

  const thisWeek = rows.filter((r) => inRange(r.starts_at, week.start, week.end));
  const weekendEvents = rows.filter((r) =>
    inRange(r.starts_at, weekend.start, weekend.end),
  );
  const soonEvents = rows
    .filter((r) => londonDate(r.starts_at).getTime() > weekend.end.getTime())
    .slice(0, 3);

  const weekCount = `${thisWeek.length} thing${thisWeek.length !== 1 ? "s" : ""} on this week`;

  const teasers: Teaser[] = weekendEvents.slice(0, 6).map((row, i) => ({
    d: formatDayLabel(row.starts_at),
    t: teaserBody(row),
    chips: buildChips(row, i === 0),
  }));

  const soon: SoonItem[] = soonEvents.map((row) => ({
    mo: formatSoonLabel(row.starts_at),
    t: teaserBody(row),
  }));

  return { weekCount, teasers, soon };
}
