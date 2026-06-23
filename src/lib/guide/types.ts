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

export type Teaser = {
  d: string;
  t: string;
  chips?: { x: string; hot?: boolean }[];
};

export type SoonItem = {
  mo: string;
  t: string;
};

export type CtxState = {
  catId: string | null;
  sub: string | null;
  tag: string | null;
  base: Venue[];
};

export type GuideData = {
  venues: Venue[];
  links: Record<string, VenueLinks>;
  weekCount: string;
  teasers: Teaser[];
  soon: SoonItem[];
};
