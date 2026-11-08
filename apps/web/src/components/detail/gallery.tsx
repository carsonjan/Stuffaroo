import { CategoryIcon } from "@/components/marketplace/category-icon";
import type { CategorySlug } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * The listing's photos. Desktop: a mosaic, one large photo and up to four
 * small ones (fewer photos, fewer cells). Mobile: a swipeable 4:5 row.
 * No photos: the 4:5 placeholder with one small category icon.
 */
export function Gallery({
  photos,
  title,
  category,
}: {
  photos: string[];
  title: string;
  category: CategorySlug;
}) {
  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-tile bg-surface text-ink-4 lg:aspect-square">
        <CategoryIcon
          category={category}
          className="size-6 md:size-7"
          strokeWidth={1.5}
        />
      </div>
    );
  }

  const [cover, ...rest] = photos.slice(0, 5);
  return (
    <>
      {/* Mobile: swipe through every photo */}
      <ul
        className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-2 overflow-x-auto px-[var(--gutter)] lg:hidden"
        aria-label={`Photos of ${title}`}
      >
        {photos.map((src, i) => (
          <li key={src} className="w-[86%] shrink-0 snap-center md:w-[55%]">
            {/* biome-ignore lint/performance/noImgElement: hot-linked mockup photos */}
            <img
              src={src}
              alt={i === 0 ? title : `${title}, photo ${i + 1}`}
              className="aspect-[4/5] w-full rounded-tile bg-surface object-cover"
            />
          </li>
        ))}
      </ul>

      {/* Desktop: mosaic */}
      <div
        className={cn(
          "hidden gap-3 lg:grid",
          rest.length === 0 && "grid-cols-1",
          rest.length === 1 && "grid-cols-2",
          rest.length >= 2 && "grid-cols-[2fr_1fr] grid-rows-2",
          rest.length >= 3 && "grid-cols-[2fr_1fr_1fr]",
        )}
      >
        <Photo
          src={cover}
          alt={title}
          className={cn(rest.length >= 2 && "row-span-2", "rounded-tile")}
        />
        {rest.map((src, i) => (
          <Photo
            key={src}
            src={src}
            alt={`${title}, photo ${i + 2}`}
            className={cn(
              "rounded-card",
              rest.length >= 2 && "aspect-auto",
              rest.length === 3 && i === 2 && "col-span-2",
            )}
          />
        ))}
      </div>
    </>
  );
}

function Photo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[4/5] overflow-hidden bg-surface",
        className,
      )}
    >
      {/* biome-ignore lint/performance/noImgElement: hot-linked mockup photos */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  );
}
