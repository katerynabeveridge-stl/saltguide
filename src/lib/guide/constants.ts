import type { Category, CuratedGuide, SoonItem, Teaser } from "./types";

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
