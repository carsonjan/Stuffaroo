import { MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

import { ListingThumb } from "@/components/marketplace/listing-thumb";
import { formatPrice } from "@/lib/format";
import { getListing, getProfile, type MatchSuggestion } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function scoreLabel(score: number) {
  if (score >= 0.9)
    return { label: "Great match", className: "bg-tint-mint text-ink" };
  if (score >= 0.7)
    return {
      label: "Good match",
      className: "border border-rule bg-paper text-ink-2",
    };
  return { label: "Partial match", className: "bg-paper-3 text-ink-3" };
}

export function MatchList({ matches }: { matches: MatchSuggestion[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {matches.map((match) => {
        const listing = getListing(match.listingId);
        if (!listing) return null;
        const owner = getProfile(listing.ownerId);
        const { label, className } = scoreLabel(match.score);
        return (
          <li key={match.listingId}>
            <Link
              href={`/listings/${listing.id}`}
              className="flex flex-col gap-4 rounded-card border bg-card p-4 transition-colors hover:border-rule-2 sm:flex-row"
            >
              <ListingThumb
                category={listing.category}
                className="rounded-small sm:w-40"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{listing.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden />{" "}
                      {listing.location}
                      {owner && <>, from {owner.displayName}</>}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold">
                    {formatPrice(listing.pricePerDay)}
                  </span>
                </div>
                <div className="rounded-small bg-muted/70 p-3 text-sm">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-accent">
                    <Sparkles className="size-3.5" aria-hidden /> Why this
                    matches
                  </p>
                  <p className="text-muted-foreground">{match.reason}</p>
                </div>
                <span
                  className={cn(
                    "w-fit rounded-pill px-2 py-0.5 text-xs font-medium",
                    className,
                  )}
                >
                  {label}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
