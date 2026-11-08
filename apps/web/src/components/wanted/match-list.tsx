import { MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

import { ListingThumb } from "@/components/marketplace/listing-thumb";
import type { Match, MatchResult } from "@/lib/api-types";
import { formatPriceCents } from "@/lib/format";

/** Says how the results were ranked, so keyword fallbacks are never passed off as AI. */
export function MatchMethodNote({ method }: { method: MatchResult["method"] }) {
  return (
    <span className="shrink-0 rounded-pill border px-2.5 py-0.5 text-xs text-muted-foreground">
      {method === "vector"
        ? "Ranked with Gemini embeddings"
        : "Keyword match (AI matching unavailable)"}
    </span>
  );
}

export function MatchList({ matches }: { matches: Match[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {matches.map(({ listing, reason }) => (
        <li key={listing.id}>
          <Link
            href={`/marketplace/listings/${listing.id}`}
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
                    {listing.location}, from {listing.owner.displayName}
                  </p>
                </div>
                <span className="shrink-0 font-medium">
                  {formatPriceCents(listing.pricePerDayCents)}
                </span>
              </div>
              <div className="rounded-small bg-muted/70 p-3 text-sm">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-accent">
                  <Sparkles className="size-3.5" aria-hidden /> Why this matches
                </p>
                <p className="text-muted-foreground">{reason}</p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
