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
  { slug: "outdoor", name: "Outdoor", tint: "bg-tint-mint text-ink" },
  { slug: "music", name: "Music", tint: "bg-tint-peach text-ink" },
  { slug: "kitchen", name: "Dorm & Kitchen", tint: "bg-tint-butter text-ink" },
  { slug: "tools", name: "Tools", tint: "bg-tint-blue text-ink" },
  { slug: "sports", name: "Sports", tint: "bg-tint-mint text-ink" },
];

/** The header's category nav, in Depop order. "Free" is a price filter, not a category. */
export const navCategories: { label: string; href: string }[] = [
  { label: "Electronics", href: "/marketplace/browse?category=electronics" },
  { label: "Textbooks", href: "/marketplace/browse?category=textbooks" },
  { label: "Dorm & Kitchen", href: "/marketplace/browse?category=kitchen" },
  { label: "Outdoor", href: "/marketplace/browse?category=outdoor" },
  { label: "Music", href: "/marketplace/browse?category=music" },
  { label: "Sports", href: "/marketplace/browse?category=sports" },
  { label: "Tools", href: "/marketplace/browse?category=tools" },
  { label: "Free", href: "/marketplace/browse?price=free" },
];

export type Condition = "New" | "Like new" | "Good" | "Fair";
export type AvailabilityStatus = "available" | "on_loan" | "paused";

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
