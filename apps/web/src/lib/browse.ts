/**
 * Browse filters: parsing ?params, applying them to tiles and requests, and
 * building the links that add or remove one filter. Everything is a GET param
 * so filters work without JavaScript and every result set has a URL.
 */

import type { ListingDetail, WantedPost } from "./api-types";
import {
  type CatalogItem,
  getSpot,
  isSpot,
  type Mode,
  type SpotSlug,
  spots,
} from "./catalog";
import {
  type CategorySlug,
  type Condition,
  categories,
  getCategory,
} from "./categories";
import { photosForTitle } from "./photos";

export const conditions: Condition[] = ["New", "Like new", "Good", "Fair"];

export const sorts = [
  { key: "newest", label: "Newest" },
  { key: "price", label: "Price, low to high" },
  { key: "nearest", label: "Nearest" },
] as const;
export type Sort = (typeof sorts)[number]["key"];

export type BrowseFilters = {
  /** null = every mode */
  mode: Mode | null;
  q: string;
  course: string;
  category: CategorySlug | null;
  condition: Condition | null;
  spot: SpotSlug | null;
  /** Whole dollars, null = no bound */
  min: number | null;
  max: number | null;
  free: boolean;
  /** YYYY-MM-DD: available on or before this day */
  date: string | null;
  sort: Sort;
};

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function dollars(value: string): number | null {
  if (value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

export function parseFilters(params: Params): BrowseFilters {
  const mode = first(params.mode);
  const category = first(params.category);
  const condition = first(params.condition);
  const spot = first(params.spot);
  const date = first(params.date);
  const sort = first(params.sort);
  return {
    mode: mode === "buy" || mode === "rent" || mode === "request" ? mode : null,
    q: first(params.q),
    course: first(params.course).toUpperCase(),
    category: getCategory(category) ? (category as CategorySlug) : null,
    condition: conditions.includes(condition as Condition)
      ? (condition as Condition)
      : null,
    spot: isSpot(spot) ? spot : null,
    min: dollars(first(params.min)),
    max: dollars(first(params.max)),
    free: first(params.price) === "free",
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    sort: sorts.some((s) => s.key === sort) ? (sort as Sort) : "newest",
  };
}

/** The URL for these filters with `patch` applied; a null/""/false value removes that param. */
export function browseHref(
  f: BrowseFilters,
  patch: Partial<BrowseFilters> = {},
): string {
  const next = { ...f, ...patch };
  const entries: [string, string][] = [];
  const add = (key: string, value: string | number | null | false) => {
    if (value !== null && value !== false && value !== "")
      entries.push([key, String(value)]);
  };
  add("mode", next.mode);
  add("q", next.q);
  add("course", next.course);
  add("category", next.category);
  add("condition", next.condition);
  add("spot", next.spot);
  add("min", next.min);
  add("max", next.max);
  add("price", next.free ? "free" : null);
  add("date", next.date);
  add("sort", next.sort === "newest" ? null : next.sort);
  const qs = new URLSearchParams(entries).toString();
  return qs ? `/marketplace/browse?${qs}` : "/marketplace/browse";
}

const monthDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** Every active filter as a removable pill: its label and the URL without it. */
export function activeFilters(
  f: BrowseFilters,
): { key: string; label: string; href: string }[] {
  const pills: { key: string; label: string; href: string }[] = [];
  if (f.q)
    pills.push({ key: "q", label: `“${f.q}”`, href: browseHref(f, { q: "" }) });
  if (f.course)
    pills.push({
      key: "course",
      label: f.course,
      href: browseHref(f, { course: "" }),
    });
  if (f.category)
    pills.push({
      key: "category",
      label: getCategory(f.category)?.name ?? f.category,
      href: browseHref(f, { category: null }),
    });
  if (f.condition)
    pills.push({
      key: "condition",
      label: f.condition,
      href: browseHref(f, { condition: null }),
    });
  if (f.spot)
    pills.push({
      key: "spot",
      label: getSpot(f.spot).name,
      href: browseHref(f, { spot: null }),
    });
  if (f.free)
    pills.push({
      key: "free",
      label: "Free",
      href: browseHref(f, { free: false }),
    });
  if (f.min !== null || f.max !== null)
    pills.push({
      key: "price",
      label:
        f.min !== null && f.max !== null
          ? `$${f.min}–$${f.max}`
          : f.min !== null
            ? `From $${f.min}`
            : `Up to $${f.max}`,
      href: browseHref(f, { min: null, max: null }),
    });
  if (f.date)
    pills.push({
      key: "date",
      label: `By ${monthDay.format(new Date(`${f.date}T00:00:00Z`))}`,
      href: browseHref(f, { date: null }),
    });
  return pills;
}

/** An API listing (always a rental or free loan) in the tile's shape. */
export function fromApi(listing: ListingDetail, now: Date): CatalogItem {
  const [firstName = "Someone"] = listing.owner.displayName.split(" ");
  const spot = spots.find((s) =>
    listing.location.toLowerCase().includes(s.name.toLowerCase()),
  );
  return {
    id: listing.id,
    href: `/marketplace/listings/${listing.id}`,
    title: listing.title,
    category: listing.category,
    mode: "rent",
    price:
      listing.pricePerDayCents === null
        ? 0
        : Math.round(listing.pricePerDayCents / 100),
    unit: listing.pricePerDayCents === null ? undefined : "day",
    deposit:
      listing.depositCents === null
        ? undefined
        : Math.round(listing.depositCents / 100),
    condition: listing.condition,
    spot: spot?.slug ?? null,
    place: listing.location,
    availability: { kind: "anytime" },
    photos: photosForTitle(listing.title),
    seller: {
      firstName,
      initials: listing.owner.initials,
      rating: null,
      handoffs: listing.owner.completedLends,
      faculty: listing.owner.program ?? "",
    },
    listedDaysAgo: Math.max(
      0,
      Math.floor(
        (now.getTime() - new Date(listing.createdAt).getTime()) / 86_400_000,
      ),
    ),
  };
}

function matchesText(haystack: string, needle: string): boolean {
  const words = needle.toLowerCase().split(/\s+/).filter(Boolean);
  const text = haystack.toLowerCase();
  return words.every((w) => text.includes(w));
}

function availableBy(item: CatalogItem, date: string, now: Date): boolean {
  if (item.availability.kind !== "from") return true;
  const from = new Date(now);
  from.setDate(from.getDate() + item.availability.inDays);
  return from.toISOString().slice(0, 10) <= date;
}

/**
 * Filters tiles. `textFiltered` marks items the API already matched against
 * q, so text isn't checked twice with different rules.
 */
export function filterItems(
  items: { item: CatalogItem; textFiltered: boolean }[],
  f: BrowseFilters,
  now: Date,
): CatalogItem[] {
  const text = [f.q, f.course].filter(Boolean).join(" ");
  return items
    .filter(({ item, textFiltered }) => {
      if (f.mode && f.mode !== "request" && item.mode !== f.mode) return false;
      if (f.category && item.category !== f.category) return false;
      if (f.condition && item.condition !== f.condition) return false;
      if (f.spot && item.spot !== f.spot) return false;
      if (f.free && item.price !== 0) return false;
      if (f.min !== null && item.price < f.min) return false;
      if (f.max !== null && item.price > f.max) return false;
      if (f.date && !availableBy(item, f.date, now)) return false;
      if (text && !textFiltered) {
        const category = getCategory(item.category)?.name ?? "";
        if (!matchesText(`${item.title} ${category}`, text)) return false;
      }
      return true;
    })
    .map(({ item }) => item);
}

export function filterRequests(
  posts: WantedPost[],
  f: BrowseFilters,
): WantedPost[] {
  const text = [f.q, f.course].filter(Boolean).join(" ");
  return posts.filter((post) => {
    const budget =
      post.budgetPerDayCents === null ? null : post.budgetPerDayCents / 100;
    if (f.category && post.category !== f.category) return false;
    if (f.free && budget !== null) return false;
    if (f.max !== null && budget !== null && budget > f.max) return false;
    if (f.min !== null && (budget === null || budget < f.min)) return false;
    if (f.date && post.startDate > f.date) return false;
    if (text && !matchesText(`${post.title} ${post.description}`, text))
      return false;
    return true;
  });
}

/** Distance on the campus map from the chosen spot (Koerner when none is chosen). */
export function nearestFrom(f: BrowseFilters): SpotSlug {
  return f.spot ?? "koerner";
}

export function sortItems(
  items: CatalogItem[],
  f: BrowseFilters,
): CatalogItem[] {
  const sorted = [...items];
  if (f.sort === "price") sorted.sort((a, b) => a.price - b.price);
  else if (f.sort === "nearest") {
    const from = getSpot(nearestFrom(f));
    const distance = (item: CatalogItem) => {
      if (!item.spot) return Number.POSITIVE_INFINITY;
      const to = getSpot(item.spot);
      return Math.hypot(to.x - from.x, to.y - from.y);
    };
    sorted.sort((a, b) => distance(a) - distance(b));
  } else sorted.sort((a, b) => a.listedDaysAgo - b.listedDaysAgo);
  return sorted;
}

export const categoryOptions = categories;

/** First two words of a title, lower-cased: how a demo item is matched to a real listing. */
export function titleKey(title: string): string {
  return title.toLowerCase().split(/\s+/).slice(0, 2).join(" ");
}

/** Demo items that duplicate a real API listing give way to it. */
export function withoutApiDuplicates(
  demo: CatalogItem[],
  api: { title: string }[],
): CatalogItem[] {
  const keys = new Set(api.map((l) => titleKey(l.title)));
  return demo.filter((item) => !keys.has(titleKey(item.title)));
}
