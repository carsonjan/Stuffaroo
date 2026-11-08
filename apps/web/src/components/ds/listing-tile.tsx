import Link from "next/link";

import { CategoryIcon } from "@/components/marketplace/category-icon";
import type { WantedPost } from "@/lib/api-types";
import { availabilityLabel, type CatalogItem, getSpot } from "@/lib/catalog";
import type { CategorySlug } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { percentOff } from "@/lib/mock-shop";
import { cn } from "@/lib/utils";

import { SaveButton } from "./save-button";

/**
 * The listing tile (Altitude Sports pattern): the tile is the photo. A 4:5 image
 * with only a badge, a heart and photo dots on it, then four lines of light type
 * below on the page background. No card, border or shadow.
 */
export function ListingTile({
  item,
  className,
}: {
  item: CatalogItem;
  className?: string;
}) {
  const place = item.spot ? getSpot(item.spot).name : (item.place ?? "Campus");
  const discount =
    item.originalPrice && item.originalPrice > item.price && item.price > 0
      ? percentOff(item.price, item.originalPrice)
      : null;

  return (
    <TileFrame
      href={item.href ?? `/marketplace/listings/${item.id}`}
      title={item.title}
      className={className}
      image={
        <TileImage
          category={item.category}
          photos={item.photos}
          alt={item.title}
        />
      }
      badge={
        discount !== null ? (
          <span className="rounded-badge bg-white px-2 py-1 text-[0.6875rem] leading-none font-medium tracking-[0.04em] text-deal md:text-[0.75rem]">
            -{discount}%
          </span>
        ) : (
          <ModeBadge>{item.mode === "buy" ? "Buy" : "Rent"}</ModeBadge>
        )
      }
      dots={item.photos.length}
      meta={`${place} · ${availabilityLabel(item.availability)}`}
      price={<ItemPrice item={item} />}
      seller={
        <>
          <Avatar initials={item.seller.initials} />
          {item.seller.firstName} ·{" "}
          {item.seller.rating !== null
            ? `${item.seller.rating.toFixed(1)} ★`
            : item.seller.handoffs
              ? `${item.seller.handoffs} ${item.seller.handoffs === 1 ? "handoff" : "handoffs"}`
              : "New here"}
        </>
      }
    />
  );
}

/** A classmate's request in the same tile shape: budget instead of price. */
export function RequestTile({
  post,
  className,
}: {
  post: WantedPost;
  className?: string;
}) {
  const firstName = post.author.displayName.split(" ")[0];
  const budget =
    post.budgetPerDayCents === null
      ? null
      : Math.round(post.budgetPerDayCents / 100);
  return (
    <TileFrame
      href={
        post.id.startsWith("w-")
          ? "/marketplace/wanted"
          : `/marketplace/wanted/${post.id}`
      }
      title={post.title}
      className={className}
      image={
        <TileImage category={post.category} photos={[]} alt={post.title} />
      }
      badge={<ModeBadge>Request</ModeBadge>}
      dots={0}
      meta={
        post.startDate === post.endDate
          ? `Needed ${formatDate(post.startDate)}`
          : `Needed ${formatDate(post.startDate)} – ${formatDate(post.endDate)}`
      }
      price={
        budget === null ? (
          <span className="t-price">Any budget</span>
        ) : (
          <span className="t-price">
            Up to ${budget}
            <span className="t-unit">/day</span>
          </span>
        )
      }
      seller={
        <>
          <Avatar initials={post.author.initials} />
          {firstName} is asking
        </>
      }
    />
  );
}

function TileFrame({
  href,
  title,
  image,
  badge,
  dots,
  meta,
  price,
  seller,
  className,
}: {
  href: string;
  title: string;
  image: React.ReactNode;
  badge: React.ReactNode;
  dots: number;
  meta: string;
  price: React.ReactNode;
  seller: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Link href={href} className="group/tile block outline-none">
        <div className="relative aspect-[4/5] overflow-hidden rounded-thumb bg-surface outline-offset-2 group-focus-visible/tile:outline-2 group-focus-visible/tile:outline-ink">
          {image}
          <div className="absolute top-2.5 left-2.5">{badge}</div>
          {dots > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-1" aria-hidden>
              {Array.from({ length: Math.min(dots, 5) }, (_, i) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: dots are positional
                  key={i}
                  className={cn(
                    "size-1.5 rounded-full",
                    i === 0 ? "bg-white" : "bg-white/50",
                  )}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5 pt-2.5">
          <p className="t-meta truncate text-ink-2">{meta}</p>
          <h3 className="t-card-title truncate text-ink">{title}</h3>
          <div className="flex items-baseline gap-2">{price}</div>
          <p className="flex items-center gap-1.5 text-[0.75rem] leading-none font-light text-ink-2">
            {seller}
          </p>
        </div>
      </Link>
      <SaveButton title={title} className="absolute top-2.5 right-2.5" />
    </div>
  );
}

function ModeBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="frost t-label inline-flex rounded-pill px-2.5 py-1.5 text-ink">
      {children}
    </span>
  );
}

function ItemPrice({ item }: { item: CatalogItem }) {
  if (item.price === 0) return <span className="t-price">Free</span>;
  return (
    <>
      <span className="t-price text-ink">
        ${item.price}
        {item.unit && <span className="t-unit">/{item.unit}</span>}
      </span>
      {item.originalPrice && item.originalPrice > item.price && (
        <span className="text-[0.75rem] font-light text-ink-3 line-through">
          <span className="visually-hidden">was </span>${item.originalPrice}
        </span>
      )}
    </>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span
      className="flex size-4 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[0.5rem] leading-none font-medium text-ink"
      aria-hidden
    >
      {initials[0]}
    </span>
  );
}

/** The 4:5 photo, or the placeholder: --surface with one small category icon. Hover scales the photo. */
export function TileImage({
  category,
  photos,
  alt,
}: {
  category: CategorySlug;
  photos: string[];
  alt: string;
}) {
  if (photos.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-ink-4">
        <CategoryIcon
          category={category}
          className="size-6 md:size-7"
          strokeWidth={1.5}
        />
      </div>
    );
  }
  return (
    <>
      {/* biome-ignore lint/performance/noImgElement: demo photos are static files */}
      <img
        src={photos[0]}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition-transform duration-[400ms] ease-out group-hover/tile:scale-[1.04]"
      />
      {photos[1] && (
        // biome-ignore lint/performance/noImgElement: demo photos are static files
        <img
          src={photos[1]}
          alt=""
          loading="lazy"
          className="absolute inset-0 hidden size-full object-cover opacity-0 transition-opacity duration-200 ease-out md:block md:group-hover/tile:opacity-100"
        />
      )}
    </>
  );
}
