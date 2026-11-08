/**
 * Sample data for the buy, deals, bundles and move-out preview, taken from the
 * team's index.html mockup. Nothing here is a real listing or transaction.
 * Discounts are always computed from the two prices, never stored.
 */

import type { CategorySlug } from "./categories";

/** The date the sample data is written against; the move-out countdown starts here. */
export const SAMPLE_TODAY = "2026-11-07";
/** Move-out day the countdown runs to (April 30). */
export const MOVE_OUT_DATE = "2027-04-30";

export type BuyListing = {
  id: string;
  title: string;
  category: CategorySlug;
  price: number;
  originalPrice: number;
  place: string;
  pickup: string;
};

export type RentListing = {
  id: string;
  title: string;
  category: CategorySlug;
  rate: string;
  deposit: number;
  place: string;
  pickup: string;
};

export type PriceDrop = {
  id: string;
  title: string;
  category: CategorySlug;
  price: number;
  originalPrice: number;
  nextPrice: number;
  nextDropIn: string;
};

export type Bundle = {
  id: string;
  title: string;
  items: string;
  count: number;
  price: number;
  originalPrice: number;
  pickup: string;
  place: string;
  categories: CategorySlug[];
};

export const buyListings: BuyListing[] = [
  {
    id: "b-1",
    title: "Desk lamp, warm LED",
    category: "electronics",
    price: 8,
    originalPrice: 25,
    place: "Koerner Library",
    pickup: "Pickup today",
  },
  {
    id: "b-2",
    title: "MATH 100 textbook, 9th ed.",
    category: "textbooks",
    price: 30,
    originalPrice: 120,
    place: "Buchanan",
    pickup: "Pickup Apr 28",
  },
  {
    id: "b-3",
    title: "Mini fridge, 3.1 cu ft",
    category: "kitchen",
    price: 60,
    originalPrice: 180,
    place: "Totem Park",
    pickup: "Pickup Apr 30",
  },
  {
    id: "b-4",
    title: "Bike lock and lights set",
    category: "sports",
    price: 15,
    originalPrice: 40,
    place: "The Nest",
    pickup: "Pickup today",
  },
];

export const rentListings: RentListing[] = [
  {
    id: "r-1",
    title: "Vacuum cleaner",
    category: "kitchen",
    rate: "$4/day",
    deposit: 30,
    place: "Orchard Commons",
    pickup: "Available now",
  },
  {
    id: "r-2",
    title: "Graphing calculator",
    category: "electronics",
    rate: "$12/term",
    deposit: 40,
    place: "Life Sciences",
    pickup: "Until Apr 25",
  },
  {
    id: "r-3",
    title: "Camping tent, 2-person",
    category: "outdoor",
    rate: "$8/day",
    deposit: 50,
    place: "Walter Gage",
    pickup: "Weekends",
  },
  {
    id: "r-4",
    title: "Mini projector",
    category: "electronics",
    rate: "$6/day",
    deposit: 40,
    place: "IKB Library",
    pickup: "From Mar 15",
  },
];

export const priceDrops: PriceDrop[] = [
  {
    id: "d-1",
    title: "Office chair, mesh back",
    category: "tools",
    price: 35,
    originalPrice: 45,
    nextPrice: 28,
    nextDropIn: "in 6h",
  },
  {
    id: "d-2",
    title: "Rice cooker, 6-cup",
    category: "kitchen",
    price: 18,
    originalPrice: 22,
    nextPrice: 14,
    nextDropIn: "tomorrow",
  },
  {
    id: "d-3",
    title: "24-inch monitor",
    category: "electronics",
    price: 70,
    originalPrice: 90,
    nextPrice: 60,
    nextDropIn: "in 2 days",
  },
];

export const bundles: Bundle[] = [
  {
    id: "k-1",
    title: "First-year dorm kit",
    items: "Bedding, lamp, hangers, kettle and more",
    count: 6,
    price: 85,
    originalPrice: 210,
    pickup: "Pickup Aug 30",
    place: "Totem Park",
    categories: ["kitchen", "electronics", "tools"],
  },
  {
    id: "k-2",
    title: "Desk setup",
    items: "Monitor, keyboard, lamp, chair",
    count: 4,
    price: 120,
    originalPrice: 290,
    pickup: "Pickup Apr 29",
    place: "Marine Drive",
    categories: ["electronics", "tools", "textbooks"],
  },
  {
    id: "k-3",
    title: "Kitchen starter",
    items: "Pots, pans, utensils, rice cooker",
    count: 9,
    price: 45,
    originalPrice: 130,
    pickup: "Pickup May 1",
    place: "Ponderosa",
    categories: ["kitchen", "kitchen", "kitchen"],
  },
];

export function percentOff(price: number, originalPrice: number): number {
  return Math.round((1 - price / originalPrice) * 100);
}
