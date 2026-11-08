/**
 * Category metadata and shared enum types. Listings, people and requests come
 * from the API; the buy/deals/move-out sample data lives in mock-shop.ts.
 */

export type CategorySlug =
  | "electronics"
  | "cameras"
  | "textbooks"
  | "outdoor"
  | "music"
  | "kitchen"
  | "tools"
  | "sports";

export type Category = {
  slug: CategorySlug;
  name: string;
  /** Tailwind classes for the pastel tile behind the category icon. */
  tint: string;
};

export const categories: Category[] = [
  { slug: "electronics", name: "Electronics", tint: "bg-tint-blue text-ink" },
  { slug: "cameras", name: "Cameras", tint: "bg-tint-peach text-ink" },
  { slug: "textbooks", name: "Textbooks", tint: "bg-tint-butter text-ink" },
  { slug: "outdoor", name: "Outdoor & Camping", tint: "bg-tint-mint text-ink" },
  { slug: "music", name: "Music", tint: "bg-tint-peach text-ink" },
  { slug: "kitchen", name: "Kitchen", tint: "bg-tint-butter text-ink" },
  { slug: "tools", name: "Tools & DIY", tint: "bg-tint-blue text-ink" },
  { slug: "sports", name: "Sports", tint: "bg-tint-mint text-ink" },
];

export type Condition = "New" | "Like new" | "Good" | "Fair";
export type AvailabilityStatus = "available" | "on_loan" | "paused";

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
