import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { discount, type Listing, money, tintFor } from "@/lib/listings";

export function ListingCard({ l }: { l: Listing }) {
  const d = discount(l);
  return (
    <Link to="/listing/$id" params={{ id: l.id }} className="group block">
      <div
        className={`chunky-sm press aspect-square overflow-hidden rounded-2xl ${tintFor(l.id)} flex items-center justify-center`}
      >
        {l.image_url ? (
          <img
            src={l.image_url}
            alt={l.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="px-4 text-center text-sm font-semibold text-muted-foreground">
            {l.title}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-xl font-bold">
          {money(l.price)}
          {l.kind === "rent" && <span className="text-sm">/term</span>}
        </span>
        {d && (
          <span className="text-sm text-muted-foreground line-through">
            {money(l.original_price)}
          </span>
        )}
        {d && (
          <span className="rounded-full bg-peach px-1.5 text-xs font-bold text-brick">
            -{d}%
          </span>
        )}
      </div>
      <p className="truncate font-semibold">{l.title}</p>
      {l.location && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {l.location}
        </p>
      )}
      <span className="mt-1 inline-block rounded-full border-2 border-ink px-2 text-xs font-semibold">
        {l.category}
      </span>
    </Link>
  );
}

export function WantedCard({ l }: { l: Listing }) {
  return (
    <Link
      to="/listing/$id"
      params={{ id: l.id }}
      className="chunky press flex flex-col rounded-2xl bg-card p-5"
    >
      <span className="w-fit rounded-full bg-lavender px-2 text-xs font-bold text-grape">
        WANTED
      </span>
      <h3 className="mt-2 text-lg font-bold leading-tight">{l.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{l.description}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-xs text-muted-foreground">
          {l.seller_name} · {l.location}
        </span>
        <span className="chunky-sm rounded-xl bg-primary px-3 py-1.5 text-sm font-bold">
          I have this!
        </span>
      </div>
    </Link>
  );
}
