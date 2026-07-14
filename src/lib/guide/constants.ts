import type { Category, CuratedGuide, FeedEvent } from "./types";

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
  "sea-views": "Sea view",
  "dog-friendly": "Dog friendly",
  "child-friendly": "Family friendly",
  "vegan-friendly": "Vegan options",
  wine: "Natural wine",
  "late-kitchen": "Late kitchen",
  "free-entry": "Free",
  send: "SEND friendly",
  "rainy-day": "Rainy day",
  "buggy-friendly": "Buggy friendly",
  babyccinos: "Babyccinos",
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


export const CURATED_GUIDES: CuratedGuide[] = [
  {
    title: "10 places to watch the World Cup",
    entries: [
      {
        name: "The Seadog",
        location: "32 Station Rd",
        ig: "theseadoghastings",
        description:
          "Settle in at The Seadog for glorious beer and good craic to go with the on-pitch antics.",
      },
      {
        name: "Bunka",
        location: "4th Floor, Observer Building",
        ig: "bunkarestaurant",
        description:
          "With the best view (and pizza) in town, Bunka is hosting ticketed screenings of all the England games.",
      },
      {
        name: "The Cutter",
        location: "11 East Parade, Hastings",
        description:
          "For cold Guinness and a lively atmosphere, head to the Cutter on the seafront. It's also running a sweepstake – entry £5.",
      },
      {
        name: "Blackbox",
        location: "10 George St",
        ig: "blackboxhst",
        description:
          "Football presenter Steve Hopper hosts a special fanzone in the heart of the Old Town, with burgers by new seafront spot Lily's.",
      },
      {
        name: "French's Bar",
        location: "24 Robertson St",
        ig: "frenchsbar_hastings",
        description:
          "Catch all the England games at cosy French's bar in town and ease any group-stage jitters with a cocktail or two.",
      },
      {
        name: "The Good Place",
        location: "53-54 Havelock Rd",
        ig: "thegoodplace_cafebar",
        description:
          "With a strict 'no pricks' policy, The Good Place promises a friendly, chilled atmosphere. Tickets from £4, with three big screens + table service.",
      },
      {
        name: "The Prince Albert",
        location: "28 Cornwallis St",
        ig: "theprince.albert",
        description:
          "Join a friendly crowd at the Prince Albert and enjoy a top selection of cask ales and craft beers.",
      },
      {
        name: "Prince of Wales",
        location: "15 Western Rd",
        ig: "thehastingsprojectpub",
        description:
          "Support your team and the community at the new Prince of Wales pub, run by the Hastings Project brewery.",
      },
      {
        name: "The Nags Head",
        location: "8-9 Gensing Rd",
        ig: "nags_head_stleonards",
        description:
          "Promising character, cold pints and good company, The Nags Head serves a rotating selection of guest cask ales.",
      },
      {
        name: "Saint Leonards Church",
        location: "London Rd",
        ig: "saintleonardschurchmarket",
        description:
          "Head to Saint Leonards Church for a big screen, Brewing Brothers beer and pop-up food vendors. Standing tickets are free.",
      },
    ],
  },
];

/** Fallback feed when Supabase events are empty / unreachable. */
export const FALLBACK_EVENTS: FeedEvent[] = [
  {
    slug: "dark-circles-late",
    dateISO: "2026-07-10",
    title: "Dark Circles",
    venue: "Marina",
    time: "7pm–midnight",
    description: "Vinyl, small plates and natural wine until midnight on the Marina.",
    cat: "music",
    free: true,
    pick: true,
    family: false,
  },
  {
    slug: "midsummer-ceilidh",
    dateISO: "2026-07-11",
    title: "A midsummer ceilidh",
    venue: "Seafront",
    time: "7pm",
    description: "Live band, caller, everyone welcome — bring soft shoes.",
    cat: "music",
    free: true,
    pick: false,
    family: true,
  },
  {
    slug: "hastings-contemporary-late",
    dateISO: "2026-07-11",
    title: "Hastings Contemporary late opening",
    venue: "Hastings Contemporary",
    time: "6pm",
    description: "Curator's tour of the new show.",
    cat: "art",
    free: false,
    pick: false,
    family: false,
    bookingUrl: "https://saltguide.substack.com",
  },
  {
    slug: "shiosai-weekend",
    dateISO: "2026-07-12",
    title: "Shiosai weekend service",
    venue: "Source Park",
    description: "Sushi and sake, walk-ins only.",
    cat: "food",
    free: false,
    pick: false,
    family: false,
  },
  {
    slug: "stade-saturdays",
    dateISO: "2026-07-18",
    title: "Stade Saturdays",
    venue: "Seafront",
    description: "Free family arts on the seafront, every weekend through summer.",
    cat: "outdoors",
    free: true,
    pick: false,
    family: true,
  },
];

export const EVENT_CATS: Record<
  string,
  { label: string; c: string; icon: string }
> = {
  music: { label: "Music & Nights Out", c: "#FF7AC6", icon: "🎸" },
  food: { label: "Food & Drink", c: "#FFA13D", icon: "🍜" },
  art: { label: "Arts & Culture", c: "#B9A8FF", icon: "🎨" },
  market: { label: "Markets & Fairs", c: "#C8F135", icon: "🧺" },
  workshop: { label: "Workshops", c: "#7BE8C0", icon: "✂️" },
  outdoors: { label: "Outdoors & Wellbeing", c: "#9BE87B", icon: "🌊" },
};

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
    "late-kitchen",
  ],
  family: ["rainy-day", "buggy-friendly", "free-entry", "babyccinos", "send"],
  culture: ["free-entry"],
};

export const HOME_PLACE_TEASER_FALLBACK = [
  {
    name: "Ritual",
    type: "Bar",
    icon: "🍸",
    c: "#FF6B57",
    line: "Cocktails that take themselves seriously so you don't have to.",
  },
  {
    name: "Kino-Teatr",
    type: "Cinema & gallery",
    icon: "🎬",
    c: "#6FD5FF",
    line: "Films, art and a courtyard made for summer evenings.",
  },
  {
    name: "Goat Ledge",
    type: "Beach café",
    icon: "🐟",
    c: "#FFA13D",
    line: "Fish finger sandwiches with the best table in town: the beach.",
  },
] as const;

export const SUBSTACK_ABOUT_URL = "https://saltguide.substack.com/about";
export const SUBSTACK_URL = "https://saltguide.substack.com";
export const INSTAGRAM_URL = "https://www.instagram.com/salt.guide/";
export const PEBBLES_URL = "https://pebbleslist.com";
