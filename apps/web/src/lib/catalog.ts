/**
 * Demo catalog for Home: buy and rent items with sellers, campus pickup spots
 * and availability. Fictional, like the rest of the demo. Dates are stored as
 * offsets from today so they never go stale. Requests come from the API
 * (WantedPost) with `sampleRequests` as the fallback when it's unreachable.
 */

import type { WantedPost } from "./api-types";
import type { CategorySlug, Condition } from "./categories";
import { photosForDemo } from "./photos";

export type Mode = "buy" | "rent" | "request";

export const modes: { key: Mode; label: string }[] = [
  { key: "buy", label: "Buy" },
  { key: "rent", label: "Rent" },
  { key: "request", label: "Request" },
];

export function parseMode(value: string | string[] | undefined): Mode {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "rent" || raw === "request" ? raw : "buy";
}

export type SpotSlug = "koerner" | "totem" | "nest" | "buchanan";

export type Spot = {
  slug: SpotSlug;
  name: string;
  /** Position on the stylised campus map, in % of the map tile. */
  x: number;
  y: number;
  /** Real location on the UBC Vancouver campus (WGS84). */
  lat: number;
  lng: number;
  /** Which side of the point the map pill sits on, when centring it would collide with a neighbour. */
  labelSide?: "left" | "right";
};

export const spots: Spot[] = [
  {
    slug: "koerner",
    name: "Koerner Library",
    x: 34,
    y: 38,
    lat: 49.26686,
    lng: -123.25526,
  },
  {
    slug: "buchanan",
    name: "Buchanan",
    x: 58,
    y: 26,
    lat: 49.26908,
    lng: -123.25456,
  },
  {
    slug: "nest",
    name: "The Nest",
    x: 68,
    y: 56,
    lat: 49.26657,
    lng: -123.24995,
    labelSide: "right",
  },
  {
    slug: "totem",
    name: "Totem Park",
    x: 24,
    y: 74,
    lat: 49.26054,
    lng: -123.25335,
  },
];

export function isSpot(value: string): value is SpotSlug {
  return spots.some((s) => s.slug === value);
}

export function getSpot(slug: SpotSlug): Spot {
  return spots.find((s) => s.slug === slug) ?? spots[0];
}

export type Seller = {
  firstName: string;
  initials: string;
  /** Null for API sellers, who have handoff counts instead of ratings. */
  rating: number | null;
  handoffs?: number;
  faculty: string;
};

const sellers = {
  maya: {
    firstName: "Maya",
    initials: "MC",
    rating: 4.9,
    faculty: "Science, 3rd year",
  },
  jordan: {
    firstName: "Jordan",
    initials: "JO",
    rating: 4.8,
    faculty: "Arts, 2nd year",
  },
  priya: {
    firstName: "Priya",
    initials: "PR",
    rating: 5.0,
    faculty: "Applied Science, 4th year",
  },
  lucas: {
    firstName: "Lucas",
    initials: "LM",
    rating: 4.7,
    faculty: "Kinesiology, 2nd year",
  },
  aiko: {
    firstName: "Aiko",
    initials: "AT",
    rating: 4.9,
    faculty: "Commerce, 3rd year",
  },
  sam: {
    firstName: "Sam",
    initials: "SP",
    rating: 4.6,
    faculty: "Science, 1st year",
  },
} satisfies Record<string, Seller>;

/** When the item can be picked up: today in a window, from a day, or any time. */
export type Availability =
  | { kind: "today"; window: string }
  | { kind: "from"; inDays: number }
  | { kind: "anytime" };

export type CatalogItem = {
  id: string;
  title: string;
  category: CategorySlug;
  mode: "buy" | "rent";
  /** Whole dollars. For rent, per `unit`. 0 means free. */
  price: number;
  unit?: "day" | "week" | "term";
  /** Buy only: the original price, shown struck through. */
  originalPrice?: number;
  deposit?: number;
  condition: Condition;
  /** A campus pickup spot, or null with `place` for API listings outside the four spots. */
  spot: SpotSlug | null;
  place?: string;
  availability: Availability;
  /** Detail page; demo items without one link to a Browse search for themselves. */
  href?: string;
  /** Image URLs; empty until real photos exist, and the tile shows its placeholder. */
  photos: string[];
  seller: Seller;
  /** Days since it was listed, for "fresh" ordering. */
  listedDaysAgo: number;
};

const rawCatalog: CatalogItem[] = [
  {
    id: "b-1",
    title: "Desk lamp, warm LED",
    category: "electronics",
    condition: "Like new",
    mode: "buy",
    price: 8,
    originalPrice: 25,
    spot: "koerner",
    availability: { kind: "today", window: "3–6PM" },
    photos: [],
    seller: sellers.maya,
    listedDaysAgo: 0,
  },
  {
    id: "r-1",
    title: "Camping tent, 2-person",
    category: "outdoor",
    condition: "Good",
    mode: "rent",
    price: 8,
    unit: "day",
    deposit: 50,
    spot: "totem",
    availability: { kind: "from", inDays: 4 },
    photos: [],
    seller: sellers.lucas,
    listedDaysAgo: 0,
  },
  {
    id: "b-2",
    title: "MATH 100 textbook, 9th ed.",
    category: "textbooks",
    condition: "Good",
    mode: "buy",
    price: 30,
    originalPrice: 120,
    spot: "buchanan",
    availability: { kind: "today", window: "12–2PM" },
    photos: [],
    seller: sellers.sam,
    listedDaysAgo: 1,
  },
  {
    id: "r-2",
    title: "Canon EOS M50 + 50mm lens",
    category: "cameras",
    condition: "Like new",
    mode: "rent",
    price: 15,
    unit: "day",
    deposit: 120,
    spot: "nest",
    availability: { kind: "from", inDays: 2 },
    photos: [],
    seller: sellers.jordan,
    listedDaysAgo: 1,
  },
  {
    id: "b-3",
    title: "Mini fridge, 3.1 cu ft",
    category: "kitchen",
    condition: "Good",
    mode: "buy",
    price: 60,
    originalPrice: 180,
    spot: "totem",
    availability: { kind: "from", inDays: 3 },
    photos: [],
    seller: sellers.lucas,
    listedDaysAgo: 1,
  },
  {
    id: "r-3",
    title: "Keychron K2 mechanical keyboard",
    category: "electronics",
    condition: "Like new",
    mode: "rent",
    price: 3,
    unit: "day",
    deposit: 40,
    spot: "koerner",
    availability: { kind: "anytime" },
    photos: [],
    seller: sellers.priya,
    listedDaysAgo: 2,
  },
  {
    id: "b-4",
    title: "Bike lock and lights set",
    category: "sports",
    condition: "New",
    mode: "buy",
    price: 15,
    originalPrice: 40,
    spot: "nest",
    availability: { kind: "today", window: "5–8PM" },
    photos: [],
    seller: sellers.aiko,
    listedDaysAgo: 2,
  },
  {
    id: "r-4",
    title: "Acoustic guitar, Yamaha FG800",
    category: "music",
    condition: "Good",
    mode: "rent",
    price: 12,
    unit: "week",
    deposit: 60,
    spot: "buchanan",
    availability: { kind: "from", inDays: 1 },
    photos: [],
    seller: sellers.jordan,
    listedDaysAgo: 2,
  },
  {
    id: "b-5",
    title: "Rice cooker, 6-cup",
    category: "kitchen",
    condition: "Fair",
    mode: "buy",
    price: 18,
    originalPrice: 22,
    spot: "totem",
    availability: { kind: "anytime" },
    photos: [],
    seller: sellers.maya,
    listedDaysAgo: 3,
  },
  {
    id: "r-5",
    title: "Cordless drill and bit set",
    category: "tools",
    condition: "Good",
    mode: "rent",
    price: 4,
    unit: "day",
    deposit: 30,
    spot: "nest",
    availability: { kind: "today", window: "2–4PM" },
    photos: [],
    seller: sellers.priya,
    listedDaysAgo: 3,
  },
  {
    id: "b-6",
    title: "Calculus: Early Transcendentals",
    category: "textbooks",
    condition: "Fair",
    mode: "buy",
    price: 0,
    spot: "koerner",
    availability: { kind: "from", inDays: 2 },
    photos: [],
    seller: sellers.sam,
    listedDaysAgo: 3,
  },
  {
    id: "r-6",
    title: "TI-84 Plus CE calculator",
    category: "electronics",
    condition: "Good",
    mode: "rent",
    price: 12,
    unit: "term",
    deposit: 40,
    spot: "buchanan",
    availability: { kind: "anytime" },
    photos: [],
    seller: sellers.maya,
    listedDaysAgo: 4,
  },
  {
    id: "b-7",
    title: "Yoga mat and blocks",
    category: "sports",
    condition: "Like new",
    mode: "buy",
    price: 12,
    spot: "nest",
    availability: { kind: "from", inDays: 5 },
    photos: [],
    seller: sellers.aiko,
    listedDaysAgo: 4,
  },
  {
    id: "r-7",
    title: "Mini projector, 1080p",
    category: "electronics",
    condition: "Like new",
    mode: "rent",
    price: 6,
    unit: "day",
    deposit: 40,
    spot: "totem",
    availability: { kind: "from", inDays: 6 },
    photos: [],
    seller: sellers.lucas,
    listedDaysAgo: 5,
  },
];

/** The demo catalog, with mockup photos attached (see photos.ts). */
export const catalog: CatalogItem[] = rawCatalog.map((item) => ({
  ...item,
  photos: photosForDemo(item.id),
}));

export function itemsFor(mode: "buy" | "rent"): CatalogItem[] {
  return catalog
    .filter((item) => item.mode === mode)
    .sort((a, b) => a.listedDaysAgo - b.listedDaysAgo);
}

const monthDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/** "TODAY 3–6PM", "FROM NOV 12", "ANYTIME"; the caller upper-cases via the meta style. */
export function availabilityLabel(a: Availability, today = new Date()): string {
  if (a.kind === "today") return `Today ${a.window}`;
  if (a.kind === "anytime") return "Pick a time";
  const date = new Date(today);
  date.setDate(date.getDate() + a.inDays);
  return `From ${monthDay.format(date)}`;
}

/** Sample requests, used only when the API can't be reached. Dates are offsets from today. */
export function sampleRequests(today = new Date()): WantedPost[] {
  const iso = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const author = (displayName: string, initials: string) => ({
    id: `sample-${initials}`,
    displayName,
    campus: "UBC Vancouver",
    program: null,
    initials,
    joinedAt: iso(-200),
    completedLends: 3,
  });
  const base = { status: "open" as const, createdAt: iso(0), userId: "sample" };
  return [
    {
      ...base,
      id: "w-1",
      title: "Projector for a movie night",
      description: "Friday night in Totem.",
      category: "electronics",
      budgetPerDayCents: 1000,
      startDate: iso(3),
      endDate: iso(3),
      author: author("Aiko Tanaka", "AT"),
    },
    {
      ...base,
      id: "w-2",
      title: "Camping stove for reading week",
      description: "Two nights at Golden Ears.",
      category: "outdoor",
      budgetPerDayCents: 400,
      startDate: iso(10),
      endDate: iso(13),
      author: author("Lucas Moreau", "LM"),
    },
    {
      ...base,
      id: "w-3",
      title: "CHEM 121 lab coat",
      description: "Size M, for the term.",
      category: "textbooks",
      budgetPerDayCents: null,
      startDate: iso(1),
      endDate: iso(60),
      author: author("Sam Patel", "SP"),
    },
    {
      ...base,
      id: "w-4",
      title: "Camera for a weekend trip",
      description: "Anything with a decent lens.",
      category: "cameras",
      budgetPerDayCents: 1500,
      startDate: iso(5),
      endDate: iso(7),
      author: author("Maya Chen", "MC"),
    },
  ];
}
