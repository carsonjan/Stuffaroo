import type { CategorySlug } from "@/lib/categories";
import { cn } from "@/lib/utils";

import { CategoryIcon } from "./category-icon";

/**
 * Placeholder visual until listing photos come from Supabase Storage:
 * the category icon on Nomu's pale grid interior.
 */
export function ListingThumb({
  category,
  size = "md",
  className,
}: {
  category: CategorySlug;
  size?: "sm" | "md" | "lg" | "wide";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        "interior-grid text-ink-3",
        size === "sm" && "size-14 rounded-field",
        size === "md" && "aspect-[4/3] w-full",
        size === "lg" && "aspect-[4/3] w-full rounded-card",
        size === "wide" && "aspect-[533/280] w-full",
        className,
      )}
    >
      <CategoryIcon
        category={category}
        className={cn(
          size === "sm" ? "size-6" : size === "lg" ? "size-20" : "size-12",
          "opacity-80",
        )}
        strokeWidth={size === "lg" ? 1.25 : 1.5}
      />
    </div>
  );
}
