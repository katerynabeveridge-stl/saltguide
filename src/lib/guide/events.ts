import type { GuideEvent } from "./types";

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
  teasers: GuideEvent[];
  soon: GuideEvent[];
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
  market: "Market",
  exhibition: "Exhibition",
  workshop: "Workshop",
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

function eventEndDay(row: EventRow): Date {
  const end = row.ends_at ? londonDate(row.ends_at) : londonDate(row.starts_at);
  return startOfDayLondon(end);
}

function overlapsRange(
  row: EventRow,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  const start = startOfDayLondon(londonDate(row.starts_at));
  const end = eventEndDay(row);
  return start.getTime() <= rangeEnd.getTime() && end.getTime() >= rangeStart.getTime();
}

function formatWeekdayShort(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
  })
    .format(d)
    .toUpperCase()
    .replace(".", "");
}

function formatDayNumber(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "numeric",
  }).format(d);
}

function formatMonthShort(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    month: "short",
  })
    .format(d)
    .toUpperCase()
    .replace(".", "");
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    formatDayNumber(a) === formatDayNumber(b) &&
    formatMonthShort(a) === formatMonthShort(b) &&
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric" }).format(
      a,
    ) ===
      new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric" }).format(
        b,
      )
  );
}

function formatEventDateBlock(
  startsAt: string,
  endsAt: string | null,
): { dateLabel: string; dateSub?: string } {
  const start = londonDate(startsAt);
  const end = endsAt ? londonDate(endsAt) : start;
  const startDay = startOfDayLondon(start);
  const endDay = startOfDayLondon(end);

  if (sameCalendarDay(startDay, endDay)) {
    return {
      dateLabel: formatWeekdayShort(start),
      dateSub: formatDayNumber(start),
    };
  }

  const startMonth = formatMonthShort(start);
  const endMonth = formatMonthShort(end);
  const startWd = formatWeekdayShort(start);
  const endWd = formatWeekdayShort(end);
  const startNum = formatDayNumber(start);
  const endNum = formatDayNumber(end);

  if (startMonth === endMonth) {
    return {
      dateLabel: `${startWd}–${endWd}`,
      dateSub: `${startNum}–${endNum}`,
    };
  }

  return {
    dateLabel: `${startNum} ${startMonth}`,
    dateSub: `${endNum} ${endMonth}`,
  };
}

function formatSoonDateBlock(
  startsAt: string,
  endsAt: string | null,
): { dateLabel: string; dateSub?: string } {
  const start = londonDate(startsAt);
  const end = endsAt ? londonDate(endsAt) : start;
  const startDay = startOfDayLondon(start);
  const endDay = startOfDayLondon(end);

  if (sameCalendarDay(startDay, endDay)) {
    return {
      dateLabel: formatMonthShort(start),
      dateSub: formatDayNumber(start),
    };
  }

  const startMonth = formatMonthShort(start);
  const endMonth = formatMonthShort(end);
  if (startMonth === endMonth) {
    return {
      dateLabel: startMonth,
      dateSub: `${formatDayNumber(start)}–${formatDayNumber(end)}`,
    };
  }

  return {
    dateLabel: `${formatDayNumber(start)} ${startMonth}`,
    dateSub: `${formatDayNumber(end)} ${endMonth}`,
  };
}

function hasMeaningfulTime(iso: string): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(londonDate(iso));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return !(hour === 0 && minute === 0);
}

function formatTimeShort(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })
    .format(londonDate(iso))
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

function resolveVenue(row: EventRow): string | undefined {
  const places = row.places;
  if (places) {
    const place = Array.isArray(places) ? places[0] : places;
    if (place?.name?.trim()) return place.name.trim();
  }
  const free = row.venue_freetext?.trim();
  return free || undefined;
}

function eventDescription(row: EventRow): string | undefined {
  const desc =
    row.description_short?.trim() || row.description_long?.trim() || "";
  return desc || undefined;
}

function buildChips(row: EventRow, markHot: boolean): GuideEvent["chips"] {
  const chips: NonNullable<GuideEvent["chips"]> = [];
  const seen = new Set<string>();

  for (const type of (row.event_types ?? []).slice(0, 2)) {
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
  if (row.is_salty_pick && !chips.some((c) => c.hot)) {
    chips.push({ x: "Salt pick", hot: markHot });
  }

  return chips.length ? chips.slice(0, 3) : undefined;
}

function mapRowToGuideEvent(
  row: EventRow,
  markHot: boolean,
  variant: "weekend" | "soon",
): GuideEvent {
  const { dateLabel, dateSub } =
    variant === "soon"
      ? formatSoonDateBlock(row.starts_at, row.ends_at)
      : formatEventDateBlock(row.starts_at, row.ends_at);

  return {
    slug: row.slug,
    dateLabel,
    dateSub,
    title: row.title.trim(),
    venue: resolveVenue(row),
    time: formatEventTime(row.starts_at, row.ends_at),
    description: eventDescription(row),
    chips: buildChips(row, markHot),
    bookingUrl: row.booking_url?.trim() || undefined,
    isSaltyPick: row.is_salty_pick,
  };
}

export function mapEventsToWhatsOn(rows: EventRow[]): WhatsOnData | null {
  if (!rows.length) return null;

  const now = new Date();
  const week = currentWeekRange(now);
  const weekend = featuredWeekendRange(now);

  const thisWeek = rows.filter((r) => overlapsRange(r, week.start, week.end));
  const weekendEvents = rows.filter((r) =>
    overlapsRange(r, weekend.start, weekend.end),
  );
  const soonEvents = rows
    .filter((r) => startOfDayLondon(londonDate(r.starts_at)).getTime() > weekend.end.getTime())
    .slice(0, 3);

  const weekCount = `${thisWeek.length} thing${thisWeek.length !== 1 ? "s" : ""} on this week`;

  const teasers: GuideEvent[] = weekendEvents
    .slice(0, 6)
    .map((row, i) => mapRowToGuideEvent(row, i === 0, "weekend"));

  const soon: GuideEvent[] = soonEvents.map((row) =>
    mapRowToGuideEvent(row, false, "soon"),
  );

  return { weekCount, teasers, soon };
}
