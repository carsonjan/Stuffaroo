import type { Database } from "@/integrations/supabase/types";

export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export const CATEGORIES = [
  "Textbooks",
  "Electronics",
  "Furniture",
  "Appliances",
  "Dorm",
  "Clothing",
  "Bikes",
  "Other",
] as const;
export const KINDS = [
  { value: "sell", label: "Buy", sub: "Own it" },
  { value: "rent", label: "Rent", sub: "Borrow it" },
  { value: "wanted", label: "Request", sub: "Ask for it" },
] as const;
export const TINTS = [
  "bg-peach",
  "bg-mint",
  "bg-sky",
  "bg-lavender",
  "bg-butter",
];
export function tintFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}
export const money = (n: number | string | null) =>
  n == null ? "" : `$${Number(n).toFixed(0)}`;
export function discount(l: Listing) {
  if (!l.original_price || Number(l.original_price) <= Number(l.price))
    return null;
  return Math.round((1 - Number(l.price) / Number(l.original_price)) * 100);
}
