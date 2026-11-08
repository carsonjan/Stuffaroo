import { Clock, MapPin } from "lucide-react";

import { CategoryIcon } from "@/components/marketplace/category-icon";
import { ListingThumb } from "@/components/marketplace/listing-thumb";
import {
  type Bundle,
  type BuyListing,
  type PriceDrop,
  percentOff,
  type RentListing,
} from "@/lib/mock-shop";
import { cn } from "@/lib/utils";

/** Nomu's white card: a 12px rim around a picture well, then the details. */
const card =
  "flex min-w-0 flex-col rounded-[32px] bg-paper-2 p-2.5 shadow-card";
const softChip =
  "inline-flex w-fit items-center rounded-pill bg-paper px-2.5 py-0.5 text-xs text-ink-3 shadow-[var(--interior-edge)]";

function Well({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] shadow-[var(--interior-edge)]">
      {children}
    </div>
  );
}

function Price({
  price,
  originalPrice,
}: {
  price: number;
  originalPrice: number;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-xl tracking-[-0.02em] text-ink">${price}</span>
      <span className="text-sm text-ink-3 line-through">${originalPrice}</span>
      <span className="rounded-pill bg-wash px-2 py-0.5 text-xs font-medium text-accent-deep">
        {percentOff(price, originalPrice)}% off
      </span>
    </div>
  );
}

export function BuyCard({ item }: { item: BuyListing }) {
  return (
    <article className={card}>
      <Well>
        <ListingThumb category={item.category} />
      </Well>
      <div className="flex flex-col gap-1.5 px-3 pt-4 pb-3">
        <Price price={item.price} originalPrice={item.originalPrice} />
        <h3 className="text-base leading-snug font-medium tracking-[-0.01em] text-ink">
          {item.title}
        </h3>
        <p className="flex items-center gap-1 text-xs text-ink-3">
          <MapPin className="size-3.5 shrink-0" aria-hidden /> {item.place}
        </p>
        <span className={cn(softChip, "mt-1")}>{item.pickup}</span>
      </div>
    </article>
  );
}

export function RentCard({ item }: { item: RentListing }) {
  return (
    <article className={card}>
      <Well>
        <ListingThumb category={item.category} />
        <span className="absolute top-3 left-3 rounded-pill bg-tint-butter px-2.5 py-0.5 text-xs font-medium text-ink">
          Rentable
        </span>
      </Well>
      <div className="flex flex-col gap-1.5 px-3 pt-4 pb-3">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-xl tracking-[-0.02em] text-ink">
            {item.rate}
          </span>
          <span className="text-xs text-ink-3">+ ${item.deposit} deposit</span>
        </div>
        <h3 className="text-base leading-snug font-medium tracking-[-0.01em] text-ink">
          {item.title}
        </h3>
        <p className="flex items-center gap-1 text-xs text-ink-3">
          <MapPin className="size-3.5 shrink-0" aria-hidden /> {item.place}
        </p>
        <span className={cn(softChip, "mt-1")}>{item.pickup}</span>
      </div>
    </article>
  );
}

export function DropCard({ item }: { item: PriceDrop }) {
  return (
    <article className={card}>
      <Well>
        <ListingThumb category={item.category} />
      </Well>
      <div className="flex flex-col gap-1.5 px-3 pt-4 pb-3">
        <Price price={item.price} originalPrice={item.originalPrice} />
        <h3 className="text-base leading-snug font-medium tracking-[-0.01em] text-ink">
          {item.title}
        </h3>
        <p className="flex items-center gap-1.5 text-sm font-medium text-accent">
          <Clock className="size-4 shrink-0" aria-hidden /> Drops to $
          {item.nextPrice} {item.nextDropIn}
        </p>
      </div>
    </article>
  );
}

export function BundleCard({ item }: { item: Bundle }) {
  return (
    <article className={card}>
      <div className="grid h-[150px] grid-cols-3 gap-1.5">
        {item.categories.slice(0, 2).map((category) => (
          <div
            key={category}
            className="interior-grid flex items-center justify-center rounded-[20px] text-ink-3 shadow-[var(--interior-edge)]"
          >
            <CategoryIcon category={category} className="size-7 opacity-80" />
          </div>
        ))}
        <div className="flex items-center justify-center rounded-[20px] bg-wash text-base font-medium text-ink">
          {item.count} items
        </div>
      </div>
      <div className="flex flex-col gap-1.5 px-3 pt-4 pb-3">
        <Price price={item.price} originalPrice={item.originalPrice} />
        <h3 className="text-lg leading-snug tracking-[-0.02em] text-ink">
          {item.title}
        </h3>
        <p className="text-sm text-ink-3">{item.items}</p>
        <p className="text-xs text-ink-3">
          {item.pickup}, {item.place}
        </p>
      </div>
    </article>
  );
}
