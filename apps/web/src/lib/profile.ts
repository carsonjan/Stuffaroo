/**
 * Public profile data: the API profile and its listings, plus the demo catalog
 * items and sample reviews for the same person (the demo sellers are the
 * seeded API users, matched by full name), plus their open requests.
 */

import { getProfileWithListings, getWantedPosts } from "./api";
import type { Profile, WantedPost } from "./api-types";
import { fromApi, withoutApiDuplicates } from "./browse";
import { type CatalogItem, catalog } from "./catalog";
import { fullNames, responseTimes } from "./people";

export type Review = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  text: string;
  item: string;
  daysAgo: number;
};

/** Sample reviews (fictional, like the rest of the demo), by first name. */
const sampleReviews: Record<string, Omit<Review, "id">[]> = {
  Maya: [
    {
      author: "Sam P.",
      initials: "SP",
      rating: 5,
      text: "Lamp was exactly as described and Maya waited at Koerner when my lab ran late.",
      item: "Desk lamp",
      daysAgo: 3,
    },
    {
      author: "Aiko T.",
      initials: "AT",
      rating: 5,
      text: "Super easy handoff, rice cooker works perfectly.",
      item: "Rice cooker",
      daysAgo: 12,
    },
    {
      author: "Jordan O.",
      initials: "JO",
      rating: 4,
      text: "Calculator was great for the midterm. Returned it a day late and she was chill about it.",
      item: "TI-84",
      daysAgo: 30,
    },
  ],
  Jordan: [
    {
      author: "Lucas M.",
      initials: "LM",
      rating: 5,
      text: "Camera was clean, batteries charged, and he showed me the settings.",
      item: "Canon EOS M50",
      daysAgo: 6,
    },
    {
      author: "Priya R.",
      initials: "PR",
      rating: 5,
      text: "Guitar was in tune and came with a capo. Would rent again.",
      item: "Yamaha FG800",
      daysAgo: 21,
    },
  ],
  Priya: [
    {
      author: "Maya C.",
      initials: "MC",
      rating: 5,
      text: "Drill and bits all there. Put up three shelves in an hour.",
      item: "Cordless drill",
      daysAgo: 4,
    },
    {
      author: "Sam P.",
      initials: "SP",
      rating: 5,
      text: "Keyboard made finals week bearable.",
      item: "Keychron K2",
      daysAgo: 18,
    },
  ],
  Lucas: [
    {
      author: "Aiko T.",
      initials: "AT",
      rating: 5,
      text: "Tent packed down small and kept us dry at Golden Ears.",
      item: "Camping tent",
      daysAgo: 9,
    },
    {
      author: "Jordan O.",
      initials: "JO",
      rating: 4,
      text: "Fridge works great. Pickup at Totem was quick.",
      item: "Mini fridge",
      daysAgo: 25,
    },
  ],
  Aiko: [
    {
      author: "Priya R.",
      initials: "PR",
      rating: 5,
      text: "Bike lights are bright and the lock is solid. Friendly handoff at The Nest.",
      item: "Bike lock set",
      daysAgo: 7,
    },
  ],
  Sam: [
    {
      author: "Lucas M.",
      initials: "LM",
      rating: 5,
      text: "Textbook had helpful notes in the margins, honestly a bonus.",
      item: "MATH 100 textbook",
      daysAgo: 14,
    },
  ],
};

export type ProfileTab = "listings" | "rentals" | "requests" | "reviews";

export const profileTabs: { key: ProfileTab; label: string }[] = [
  { key: "listings", label: "Listings" },
  { key: "rentals", label: "Rentals" },
  { key: "requests", label: "Requests" },
  { key: "reviews", label: "Reviews" },
];

export type ProfileData = {
  profile: Profile;
  /** For sale */
  forSale: CatalogItem[];
  /** For rent or free loan */
  forRent: CatalogItem[];
  requests: WantedPost[];
  reviews: Review[];
  rating: number | null;
  responseTime: string | null;
};

/** Null when the profile doesn't exist. Throws ApiError when the API is down. */
export async function loadProfile(
  id: string,
  now: Date,
): Promise<ProfileData | null> {
  const data = await getProfileWithListings(id);
  if (!data) return null;
  const { profile, listings } = data;
  const firstName = Object.entries(fullNames).find(
    ([, full]) => full === profile.displayName,
  )?.[0];

  const demo = firstName
    ? withoutApiDuplicates(
        catalog.filter((item) => item.seller.firstName === firstName),
        listings,
      )
    : [];
  const api = listings.map((l) => fromApi(l, now));

  let requests: WantedPost[] = [];
  try {
    requests = (await getWantedPosts()).filter((p) => p.author.id === id);
  } catch {
    requests = [];
  }

  const reviews = (firstName ? (sampleReviews[firstName] ?? []) : []).map(
    (r, i) => ({ ...r, id: `${firstName}-${i}` }),
  );
  const rating = reviews.length
    ? Math.round(
        (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10,
      ) / 10
    : null;

  return {
    profile,
    forSale: demo.filter((item) => item.mode === "buy"),
    forRent: [...api, ...demo.filter((item) => item.mode === "rent")],
    requests,
    reviews,
    rating,
    responseTime: firstName ? (responseTimes[firstName] ?? null) : null,
  };
}
