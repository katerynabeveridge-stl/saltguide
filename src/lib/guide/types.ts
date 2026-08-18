export type Venue = {
  slug: string;
  n: string;
  types: string[];
  a: string;
  tags: string[];
  b: string;
  tip: string | null;
  booking: "walk-in" | "book-ahead";
  sp: boolean;
  isNew: boolean;
  isFree: boolean;
  coverImageUrl?: string;
  coverImageAlt?: string;
  galleryImageUrls?: string[];
  isFeatured?: boolean;
};

export type VenueLinks = {
  w?: string;
  ig?: string;
};

export type Category = {
  id: string;
  label: string;
  desc?: string;
  soon?: boolean;
  tagline?: string;
  pebblesCta?: boolean;
};

export type GuideDef = {
  title: string;
  match: (venue: Venue) => boolean;
};

export type CuratedGuideEntry = {
  name: string;
  location?: string;
  ig?: string;
  description: string;
};

export type CuratedGuide = {
  title: string;
  entries: CuratedGuideEntry[];
};

/** Structured highlight used by older weekend/soon blocks and fallbacks. */
export type GuideEvent = {
  slug: string;
  dateLabel: string;
  dateSub?: string;
  title: string;
  venue?: string;
  time?: string;
  description?: string;
  chips?: { x: string; hot?: boolean }[];
  bookingUrl?: string;
  isSaltyPick?: boolean;
};

export type EventCat =
  | "music"
  | "food"
  | "art"
  | "market"
  | "workshop"
  | "outdoors";

/** Flat feed card for the new What's On UI. */
export type FeedEvent = {
  slug: string;
  dateISO: string;
  /** Inclusive end from `events.recurrence_end_date`, if the row has one. */
  endISO?: string;
  title: string;
  venue?: string;
  time?: string;
  description?: string;
  detail?: string;
  /** Raw DB `type` (e.g. exhibition, music, class). */
  type?: string | null;
  /** Heuristic tint/icon from type/tags — not used for What's On type filters. */
  cat: EventCat;
  /** DB `events.saltguide_category`. Null if unmapped or the column is missing. */
  saltguideCategory: string | null;
  free: boolean;
  pick: boolean;
  /** Flagged via events.is_top_event — shown in the home "Top events coming up" section. */
  top: boolean;
  /** DB `events.is_send_friendly` — Millie / SEND-friendly badge. */
  family: boolean;
  /** DB `events.show_on_pebbles` — What's On family-friendly filter. */
  pebbles: boolean;
  bookingUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  price?: string;
  recurs?: string;
};

export type CtxState = {
  catId: string | null;
  sub: string | null;
  /** Good-for tags — multi-select (AND). */
  tags: string[];
  base: Venue[];
};

export type GuideData = {
  venues: Venue[];
  links: Record<string, VenueLinks>;
  events: FeedEvent[];
};
