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
  title: string;
  venue?: string;
  time?: string;
  description?: string;
  detail?: string;
  cat: EventCat;
  free: boolean;
  pick: boolean;
  family: boolean;
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
