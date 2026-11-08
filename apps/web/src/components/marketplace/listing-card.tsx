import Link from "next/link";

import type { ListingDetail } from "@/lib/api-types";
import { getCategory } from "@/lib/categories";
import { formatPriceCents } from "@/lib/format";
import { ListingThumb } from "./listing-thumb";
import { AvailabilityBadge } from "./status-badge";

/** A white-rimmed card: a pastel picture, then title, price and pickup. */
export function ListingCard({ listing }: { listing: ListingDetail }) {
  const { owner } = listing;
  const category = getCategory(listing.category);
  const isFree = listing.pricePerDayCents === null;

  return (
    <Link
      href={`/marketplace/listings/${listing.id}`}
      className="group flex min-w-0 flex-col rounded-[40px] bg-paper-2 p-3 shadow-card transition-transform duration-[220ms] ease-out hover:-translate-y-1"
    >
      <div className="relative overflow-hidden rounded-[28px] shadow-[var(--interior-edge)]">
        <ListingThumb category={listing.category} size="wide" />
        {listing.availability !== "available" && (
          <div className="absolute top-3 left-3">
            <AvailabilityBadge status={listing.availability} />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-2 px-4 pt-5 pb-4">
        <h3 className="text-xl leading-snug tracking-[-0.02em] text-ink">
          {listing.title}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-pill bg-paper px-2.5 py-0.5 text-xs text-ink-3 shadow-[var(--interior-edge)]">
            {category?.name}
          </span>
          <span
            className={
              isFree ? "font-medium text-accent" : "font-medium text-ink"
            }
          >
            {formatPriceCents(listing.pricePerDayCents)}
          </span>
        </div>
        <p className="text-xs text-ink-3">
          {listing.location}, from {owner.displayName.split(" ")[0]},{" "}
          {listing.condition.toLowerCase()}
        </p>
      </div>
    </Link>
  );
}
