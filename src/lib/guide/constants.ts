import type { Category, GuideDef, SoonItem, Teaser } from "./types";

export const TYPE_SECTION: Record<string, string[]> = {
  restaurant: ["eatdrink"],
  cafe: ["eatdrink"],
  bar: ["eatdrink"],
  pub: ["eatdrink"],
  bakery: ["eatdrink"],
  takeaway: ["eatdrink"],
  museum: ["culture"],
  gallery: ["culture", "family"],
  theatre: ["culture"],
  music_venue: ["culture"],
  cinema: ["culture", "family"],
  workshop: ["culture"],
  gym: ["wellness"],
  yoga_studio: ["wellness"],
  sauna: ["wellness"],
  swim_spot: ["wellness", "family"],
  beach: ["wellness", "family"],
  park: ["family"],
  garden: ["wellness"],
  playground: ["family"],
  soft_play: ["family"],
  play_cafe: ["family", "eatdrink"],
  farm: ["family"],
  shop: ["shops"],
  market: ["shops", "eatdrink"],
  holiday_let: ["stay"],
};

export const GOOD_FOR: Record<string, string> = {
  "date-night": "Date night",
  "night-out": "Night out",
  roast: "Sunday roast",
  breakfast: "Brunch",
  "coffee-cake": "Coffee & cake",
  "sea-views": "Sea views",
  "dog-friendly": "Dog friendly",
  "child-friendly": "Family friendly",
  "vegan-friendly": "Vegan options",
  wine: "Natural wine",
  "free-entry": "Free entry",
  send: "SEND friendly",
};

export const CATS: Category[] = [
  {
    id: "eatdrink",
    label: "Eat & Drink",
    desc: "Restaurants, bars, coffee & bakeries, street food",
  },
  {
    id: "family",
    label: "Family",
    desc: "Family restaurants, soft plays, parks & museums",
    pebblesCta: true,
  },
  {
    id: "culture",
    label: "Culture",
    desc: "Museums, galleries, cinema & workshops",
  },
  {
    id: "stay",
    label: "Stay",
    soon: true,
    tagline: "Coastal boltholes & holiday lets",
  },
  {
    id: "wellness",
    label: "Wellness",
    soon: true,
    tagline: "Saunas, studios & sea swims",
  },
  {
    id: "shops",
    label: "Shops",
    soon: true,
    tagline: "Independents & makers",
  },
];

export const SUBTYPES: Record<
  string,
  { id: string; short: string; types: string[] }[]
> = {
  eatdrink: [
    { id: "eat", short: "Eat", types: ["restaurant", "pub", "takeaway"] },
    { id: "coffee", short: "Coffee", types: ["cafe", "bakery"] },
    { id: "drink", short: "Drink", types: ["bar"] },
  ],
  family: [
    { id: "softplay", short: "Soft play", types: ["soft_play", "play_cafe"] },
    { id: "outdoors", short: "Outdoors", types: ["park", "playground", "farm", "beach"] },
    {
      id: "daysout",
      short: "Days out",
      types: ["museum", "gallery", "cinema", "workshop", "swim_spot", "gym"],
    },
    { id: "eat", short: "Eat", types: ["restaurant", "cafe", "bakery", "bar", "pub"] },
  ],
  culture: [
    { id: "museums", short: "Museums", types: ["museum"] },
    { id: "galleries", short: "Galleries", types: ["gallery"] },
    { id: "cinema", short: "Cinema", types: ["cinema"] },
    { id: "workshops", short: "Workshops", types: ["workshop", "theatre", "music_venue"] },
  ],
};

export const GUIDES: GuideDef[] = [
  { title: "Best Sunday Roasts", match: (v) => v.tags.includes("roast") },
  { title: "Date Night", match: (v) => v.tags.includes("date-night") },
  { title: "Brunch & Breakfast", match: (v) => v.tags.includes("breakfast") },
  { title: "Dog Friendly", match: (v) => v.tags.includes("dog-friendly") },
  { title: "Just Landed", match: (v) => v.isNew },
];

export const TEASERS: Teaser[] = [
  {
    d: "Fri",
    t: "<b>Dark Circles</b> goes late — vinyl, small plates and natural wine until midnight on the Marina.",
    chips: [{ x: "Late", hot: true }, { x: "Free entry" }],
  },
  {
    d: "Sat",
    t: "<b>A midsummer ceilidh</b> on the seafront. Live band, caller, everyone welcome — bring soft shoes.",
    chips: [{ x: "Family" }, { x: "Outdoors" }, { x: "Free" }],
  },
  {
    d: "Sat",
    t: "<b>Hastings Contemporary</b> late opening with a curator's tour of the new show.",
    chips: [{ x: "Culture" }, { x: "Booking" }],
  },
  {
    d: "Sun",
    t: "<b>Shiosai</b>'s first proper weekend service at Source Park — sushi and sake, walk-ins only.",
    chips: [{ x: "New" }, { x: "Food" }],
  },
];

export const SOON: SoonItem[] = [
  {
    mo: "Jul 5",
    t: "<b>Stade Saturdays</b> kick off — free family arts on the seafront, every weekend through summer.",
  },
  {
    mo: "Jul 12",
    t: "<b>Coastal Currents</b> open studios begin: artists across Hastings & St Leonards open their doors.",
  },
  {
    mo: "Jul 19",
    t: "<b>Pig racing & pop-ups</b> at the farmers' market — the big one before the holidays hit.",
  },
];

export const WEEK_COUNT = "31 things on this week";

export const TYPE_LABEL: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Café",
  bar: "Bar",
  pub: "Pub",
  bakery: "Bakery",
  takeaway: "Takeaway",
  museum: "Museum",
  gallery: "Gallery",
  theatre: "Theatre",
  music_venue: "Live music",
  cinema: "Cinema",
  workshop: "Workshop",
  gym: "Sport & swim",
  yoga_studio: "Yoga",
  sauna: "Sauna",
  swim_spot: "Swimming",
  beach: "Beach",
  park: "Park",
  garden: "Garden",
  playground: "Seaside fun",
  soft_play: "Soft play",
  play_cafe: "Play café",
  farm: "Farm",
  shop: "Shop",
  market: "Market",
  holiday_let: "Stay",
};

export const KIND_ORDER: Record<string, string[]> = {
  family: [
    "soft_play",
    "play_cafe",
    "playground",
    "park",
    "farm",
    "beach",
    "swim_spot",
    "gym",
    "museum",
    "gallery",
    "cinema",
    "workshop",
    "restaurant",
    "cafe",
    "bakery",
    "bar",
    "pub",
  ],
  culture: ["museum", "gallery", "cinema", "workshop", "theatre", "music_venue", "park"],
  eatdrink: ["restaurant", "bar", "pub", "cafe", "bakery", "takeaway"],
};

export const SECTION_GOODFOR: Record<string, string[]> = {
  eatdrink: [
    "date-night",
    "roast",
    "breakfast",
    "coffee-cake",
    "sea-views",
    "dog-friendly",
    "vegan-friendly",
    "night-out",
    "wine",
  ],
  family: ["free-entry", "send"],
  culture: ["free-entry"],
};

export const SUBSTACK_ABOUT_URL = "https://saltguide.substack.com/about";
export const SUBSTACK_URL = "https://saltguide.substack.com";
export const INSTAGRAM_URL = "https://www.instagram.com/salt.guide/";
export const PEBBLES_URL = "https://pebbleslist.com";
