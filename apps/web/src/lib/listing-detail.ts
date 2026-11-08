/**
 * Listing detail data for both kinds of listing: demo catalog items (ids like
 * "b-1") and real API listings (UUIDs). Both become one `DetailListing`.
 */

import { getListing, getListings } from "./api";
import type { ListingDetail } from "./api-types";
import { fromApi, withoutApiDuplicates } from "./browse";
import { type CatalogItem, catalog, getSpot } from "./catalog";
import { fullNames, responseTimes } from "./people";

export type DetailSeller = {
  name: string;
  initials: string;
  faculty: string;
  rating: number | null;
  handoffs: number;
  /** Demo sellers only; API profiles don't carry it. */
  responseTime: string | null;
  profileHref: string | null;
};

/** The other way to get the same item, for the Buy / Rent toggle. */
export type AltOffer = {
  mode: "buy" | "rent";
  price: number;
  unit?: "day" | "week" | "term";
  deposit?: number;
};

export type DetailListing = {
  item: CatalogItem;
  description: string;
  seller: DetailSeller;
  alt: AltOffer | null;
  /** The API listing, when this is a real one (it drives the real request form). */
  api: ListingDetail | null;
};

const descriptions: Record<string, string> = {
  "b-1":
    "Warm LED desk lamp with three brightness levels and a USB port in the base. Bought in September, moving to a place with built-in lights.",
  "r-1":
    "Two-person backpacking tent, packs down small and sets up in five minutes. Comes with stakes, footprint and a rain fly. Great for Golden Ears or Garibaldi.",
  "b-2":
    "MATH 100 textbook, 9th edition, the one the course still uses. Some pencil notes in chapters 2 and 3, otherwise clean.",
  "r-2":
    "Canon EOS M50 with the 50mm f/1.8. Two batteries, charger and a 64GB card. Perfect for a weekend trip or a club shoot.",
  "b-3":
    "3.1 cu ft mini fridge with a small freezer shelf. Fits under a residence desk. Cleaned and defrosted, ready to plug in.",
  "r-3":
    "Keychron K2 with brown switches, Bluetooth or USB-C. Quiet enough for Koerner. Good for a week of essay writing.",
  "b-4":
    "U-lock with two keys plus front and rear USB lights. Lock mount included. My bike got stolen, the lock didn't fail, I just left it unlocked.",
  "r-4":
    "Yamaha FG800 acoustic, new strings last month. Comes with a soft case, capo and picks. Rent by the week to see if you stick with it.",
  "b-5":
    "Six-cup rice cooker with a steaming tray. Works perfectly, the inner pot has no scratches.",
  "r-5":
    "18V cordless drill with two batteries and a 30-piece bit set. Ideal for putting up shelves at the start of term.",
  "b-6":
    "Calculus: Early Transcendentals. Older edition, but the problem sets line up with MATH 100 and 101. Free to a good home.",
  "r-6":
    "TI-84 Plus CE, charges over USB. Rent it for the term and give it back after finals.",
  "b-7":
    "Yoga mat (6mm) with two foam blocks and a strap. Used for one term of classes at the Rec Centre.",
  "r-7":
    "1080p mini projector with HDMI and a small tripod. Bright enough for a dorm movie night with the lights off.",
};

/** Demo items that can be bought or rented. */
const altOffers: Record<string, AltOffer> = {
  "b-3": { mode: "rent", price: 10, unit: "week", deposit: 40 },
  "r-4": { mode: "buy", price: 140 },
  "r-7": { mode: "buy", price: 55 },
};

function fromDemo(item: CatalogItem): DetailListing {
  return {
    item,
    description: descriptions[item.id] ?? item.title,
    seller: {
      name: fullNames[item.seller.firstName] ?? item.seller.firstName,
      initials: item.seller.initials,
      faculty: item.seller.faculty,
      rating: item.seller.rating,
      handoffs: item.seller.handoffs ?? 0,
      responseTime: responseTimes[item.seller.firstName] ?? null,
      profileHref: null,
    },
    alt: altOffers[item.id] ?? null,
    api: null,
  };
}

function fromApiDetail(listing: ListingDetail, now: Date): DetailListing {
  return {
    item: fromApi(listing, now),
    description: listing.description,
    seller: {
      name: listing.owner.displayName,
      initials: listing.owner.initials,
      faculty: listing.owner.program ?? listing.owner.campus ?? "UBC",
      rating: null,
      handoffs: listing.owner.completedLends,
      responseTime: null,
      profileHref: `/marketplace/profile/${listing.owner.id}`,
    },
    alt: null,
    api: listing,
  };
}

/** A demo item (no API call) or an API listing. Null when neither exists. */
export async function loadDetail(
  id: string,
  now: Date,
): Promise<DetailListing | null> {
  const demo = catalog.find((item) => item.id === id);
  if (demo) {
    const d = fromDemo(demo);
    // Demo sellers are the seeded API users; link the card to their real profile.
    try {
      const owner = (await getListings()).find(
        (l) => l.owner.displayName === d.seller.name,
      )?.owner;
      if (owner) d.seller.profileHref = `/marketplace/profile/${owner.id}`;
    } catch {
      // No API: the card just isn't a link.
    }
    return d;
  }
  const listing = await getListing(id);
  return listing ? fromApiDetail(listing, now) : null;
}

export function detailTitle(id: string): string | null {
  return catalog.find((item) => item.id === id)?.title ?? null;
}

/** Everything a related rail can draw from: the demo catalog plus API listings. */
export async function relatedPool(now: Date): Promise<CatalogItem[]> {
  let listings: ListingDetail[] = [];
  try {
    listings = await getListings();
  } catch {
    listings = [];
  }
  return [
    ...withoutApiDuplicates(catalog, listings),
    ...listings.map((l) => fromApi(l, now)),
  ];
}

/** Other listings by the same seller (matched on first name and initials, which both sources carry). */
export function moreFromSeller(
  pool: CatalogItem[],
  d: DetailListing,
): CatalogItem[] {
  return pool.filter(
    (item) =>
      item.id !== d.item.id &&
      item.seller.initials === d.item.seller.initials &&
      item.seller.firstName === d.item.seller.firstName,
  );
}

/** Same category first, then anything else, nearest pickup spot first. */
export function similarNearby(
  pool: CatalogItem[],
  d: DetailListing,
): CatalogItem[] {
  const from = d.item.spot ? getSpot(d.item.spot) : null;
  const distance = (item: CatalogItem) => {
    if (!from || !item.spot) return 1000;
    const to = getSpot(item.spot);
    return Math.hypot(to.x - from.x, to.y - from.y);
  };
  return pool
    .filter(
      (item) => item.id !== d.item.id && item.category === d.item.category,
    )
    .sort((a, b) => distance(a) - distance(b))
    .slice(0, 8);
}

/** Three pickup slots from the item's availability, as short labels. */
export function pickupSlots(item: CatalogItem, now: Date): string[] {
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const start =
    item.availability.kind === "from" ? item.availability.inDays : 0;
  const windows =
    item.availability.kind === "today"
      ? [item.availability.window, item.availability.window, "12–2PM"]
      : ["12–2PM", "3–6PM", "5–8PM"];
  return windows.map((w, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + start + i);
    const label =
      start + i === 0 ? "Today" : start + i === 1 ? "Tomorrow" : day.format(d);
    return `${label} · ${w}`;
  });
}
