import { ArrowRight, BadgeCheck, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ListingTile, RequestTile } from "@/components/ds/listing-tile";
import { ModeToggle } from "@/components/ds/mode-toggle";
import { Rail } from "@/components/ds/rail";
import { ScrollFillText } from "@/components/ds/scroll-fill-text";
import { SearchBox } from "@/components/ds/search-box";
import { Sticker } from "@/components/ds/sticker";
import { CampusMap } from "@/components/marketplace/campus-map";
import { CategoryIcon } from "@/components/marketplace/category-icon";
import { Roo } from "@/components/roo";
import { buttonVariants } from "@/components/ui/button";
import { getWantedPosts } from "@/lib/api";
import type { WantedPost } from "@/lib/api-types";
import {
  type CatalogItem,
  catalog,
  itemsFor,
  type Mode,
  parseMode,
  sampleRequests,
  spots,
} from "@/lib/catalog";
import { categories } from "@/lib/categories";
import { MOVE_OUT_DATE } from "@/lib/mock-shop";
import { categoryPhotos } from "@/lib/photos";
import { cn } from "@/lib/utils";

const trust = [
  { icon: BadgeCheck, label: "UBC-verified students" },
  { icon: MapPin, label: "Pickup on campus" },
  { icon: Star, label: "Rated after every handoff" },
];

const railTitles: Record<Mode, string> = {
  buy: "Fresh on campus",
  rent: "Rent it this week",
  request: "Wanted by classmates",
};

export default function HomePage({ searchParams }: PageProps<"/marketplace">) {
  // Mode (?mode=) and requests (API) are request-time data; the fallback is Buy with no requests yet.
  return (
    <Suspense fallback={<HomeView mode="buy" wanted={[]} shell />}>
      <HomeWithData searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeWithData({
  searchParams,
}: Pick<PageProps<"/marketplace">, "searchParams">) {
  const [params, wanted] = await Promise.all([searchParams, loadWanted()]);
  return <HomeView mode={parseMode(params.mode)} wanted={wanted} />;
}

/** `shell` is the prerendered fallback: only the parts that don't depend on today's date. */
function HomeView({
  mode,
  wanted,
  shell = false,
}: {
  mode: Mode;
  wanted: WantedPost[];
  shell?: boolean;
}) {
  const buy = itemsFor("buy");
  const rent = itemsFor("rent");
  const counts: Record<Mode, number> = {
    buy: buy.length,
    rent: rent.length,
    request: wanted.length,
  };
  const items = mode === "buy" ? buy : mode === "rent" ? rent : [];
  const hrefFor = (m: Mode) =>
    m === "buy" ? "/marketplace" : `/marketplace?mode=${m}`;

  return (
    <div className="flex flex-col gap-[var(--section-gap)] pt-4 md:pt-6">
      <Hero mode={mode} counts={counts} hrefFor={hrefFor} />
      <Manifesto />
      <Categories mode={mode} />
      {shell ? null : (
        <>
          <Rail
            key={mode}
            className="settle-in"
            title={railTitles[mode]}
            allHref={`/marketplace/browse?mode=${mode}`}
            allLabel={mode === "request" ? "See all requests" : "Shop all"}
          >
            {mode === "request"
              ? wanted.map((post) => <RequestTile key={post.id} post={post} />)
              : items.map((item) => <ListingTile key={item.id} item={item} />)}
          </Rail>

          <PickupMap mode={mode} wantedCount={wanted.length} />
          <MoveOut />

          {mode !== "request" && wanted.length > 0 && (
            <Rail
              title="Wanted by classmates"
              allHref="/marketplace/wanted"
              allLabel="See all requests"
            >
              {wanted.map((post) => (
                <RequestTile key={post.id} post={post} />
              ))}
            </Rail>
          )}
        </>
      )}
    </div>
  );
}

/** Open requests from the API, or the sample set when it can't be reached or is empty. */
async function loadWanted(): Promise<WantedPost[]> {
  try {
    const posts = await getWantedPosts();
    return posts.length > 0 ? posts : sampleRequests();
  } catch {
    return sampleRequests();
  }
}

function Hero({
  mode,
  counts,
  hrefFor,
}: {
  mode: Mode;
  counts: Record<Mode, number>;
  hrefFor: (m: Mode) => string;
}) {
  return (
    <section className="container">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-4">
        {/* Left tile: status, headline, toggle, search */}
        <div className="flex flex-col rounded-tile bg-surface px-5 pt-6 pb-5 md:px-10 md:pt-10 md:pb-8">
          <p className="t-label flex w-fit items-center rounded-pill bg-white px-3.5 py-2 text-ink">
            128 students listing this week
          </p>
          <h1 className="t-display mt-8 md:mt-12">
            Pass it
            <br />
            on campus
          </h1>
          <p className="t-body mt-5 max-w-[40ch] text-ink-2 md:mt-6">
            Buy, rent or ask for everyday things, and pick them up between
            classes.
          </p>
          <div className="mt-8 flex flex-col gap-3 md:mt-auto md:pt-10">
            <ModeToggle
              active={mode}
              counts={counts}
              hrefs={{
                buy: hrefFor("buy"),
                rent: hrefFor("rent"),
                request: hrefFor("request"),
              }}
              className="w-fit"
            />
            {/* Roo peeks over the search and grips its top edge (Hopper-style) */}
            <div className="group/peek relative mt-14 sm:mt-0">
              <Roo className="absolute right-5 bottom-[calc(100%-10px)] z-10 w-[120px] md:right-8" />
              <SearchBox id="hero-search" mode={mode} />
            </div>
          </div>
        </div>

        {/* Right tile: a collage of listings in rounded frames, with the stickers */}
        <Collage />
      </div>

      {/* Trust row (Depop): directly under the hero */}
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:mt-8 md:gap-x-14">
        {trust.map(({ icon: Icon, label }) => (
          <li key={label} className="t-label flex items-center gap-2 text-ink">
            <Icon className="size-4" strokeWidth={1.5} aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Prints tossed on a table: later entries land on top. Positions are percentages
 * of a 9:10 stage, so the spread keeps its shape at every width.
 */
const scatter: {
  id: string;
  left: number;
  top: number;
  width: number;
  rotate: number;
}[] = [
  { id: "r-4", left: 65, top: 0, width: 32, rotate: 11 },
  { id: "b-1", left: 0, top: 4, width: 34, rotate: -9 },
  { id: "r-2", left: 33, top: 21, width: 34, rotate: 5 },
  { id: "r-3", left: 2, top: 56, width: 33, rotate: 7 },
  { id: "r-1", left: 64, top: 50, width: 34, rotate: -10 },
  { id: "b-3", left: 34, top: 62, width: 32, rotate: -3 },
];

function Collage() {
  const byId = new Map(catalog.map((item) => [item.id, item]));
  return (
    <div className="relative flex items-center justify-center rounded-tile bg-surface-2 px-[5%] py-12 lg:min-h-[640px]">
      <div className="relative aspect-[9/10] w-full max-w-[600px]">
        {scatter.map(({ id, ...pos }) => {
          const item = byId.get(id);
          return item ? <CollageFrame key={id} item={item} {...pos} /> : null;
        })}
      </div>

      <Sticker
        variant="burst"
        fill="lime"
        rotate={10}
        className="absolute top-[3%] right-[3%] z-10 size-[96px] md:size-[120px]"
      >
        4.9 ★ from classmates
      </Sticker>
      <Sticker
        variant="pill"
        fill="peach"
        rotate={-6}
        className="absolute bottom-[4%] left-[5%] z-10"
      >
        Pickup on campus
      </Sticker>
    </div>
  );
}

/** One photo print: white border, a tilt, and it lifts to the top of the pile on hover. */
function CollageFrame({
  item,
  left,
  top,
  width,
  rotate,
}: {
  item: CatalogItem;
  left: number;
  top: number;
  width: number;
  rotate: number;
}) {
  const price =
    item.price === 0
      ? "Free"
      : `$${item.price}${item.unit ? `/${item.unit}` : ""}`;
  return (
    <Link
      href={`/marketplace/listings/${item.id}`}
      className="absolute rounded-[14px] bg-white p-1.5 shadow-float transition-[scale] duration-[400ms] ease-out hover:z-20 hover:scale-[1.05] md:p-2"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        rotate: `${rotate}deg`,
      }}
    >
      <span className="relative block aspect-[4/5] overflow-hidden rounded-[9px] bg-surface">
        {item.photos[0] ? (
          // biome-ignore lint/performance/noImgElement: hot-linked mockup photos, cropped by the Unsplash CDN
          <img
            src={item.photos[0]}
            alt={item.title}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-ink-4">
            <CategoryIcon
              category={item.category}
              className="size-6 md:size-7"
              strokeWidth={1.5}
            />
          </span>
        )}
        <span className="frost t-label absolute bottom-2 left-2 max-w-[calc(100%-16px)] truncate rounded-pill px-2.5 py-1.5 text-ink">
          {price} · {item.title.split(",")[0]}
        </span>
      </span>
    </Link>
  );
}

function Manifesto() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white md:py-36">
      <div className="container flex flex-col items-center text-center">
        <p className="t-label text-white/70">Why Stuffaroo</p>
        <ScrollFillText
          tone="dark"
          className="mt-8 text-center"
          text="Every dorm on campus is full of stuff someone else needs this week. Stuffaroo moves it a few hundred metres instead of to the landfill."
        />
      </div>
      <Sticker
        variant="pill"
        fill="lime"
        rotate={8}
        className="absolute -right-3 bottom-10 md:right-10 md:bottom-14"
      >
        Free stuff Friday
      </Sticker>
    </section>
  );
}

function Categories({ mode }: { mode: Mode }) {
  const counts = new Map<string, number>();
  if (mode !== "request") {
    for (const item of itemsFor(mode)) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
  }
  return (
    <section className="container">
      <h2 className="t-h2">Shop by category</h2>
      <ul className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-4">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/marketplace/browse?mode=${mode}&category=${c.slug}`}
              className="group/cat relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-tile bg-surface p-3 outline-offset-2 md:p-4"
            >
              {categoryPhotos[c.slug] ? (
                // biome-ignore lint/performance/noImgElement: hot-linked mockup photos
                <img
                  src={categoryPhotos[c.slug]}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition-transform duration-[400ms] ease-out group-hover/cat:scale-[1.04]"
                />
              ) : (
                <CategoryIcon
                  category={c.slug}
                  className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-ink-4 md:size-7"
                  strokeWidth={1.5}
                />
              )}
              <span className="relative flex items-end justify-between gap-2">
                <span className="frost flex min-w-0 flex-col gap-0.5 rounded-card px-3 py-2">
                  <span className="t-label truncate text-ink">{c.name}</span>
                  {mode !== "request" && (
                    <span className="t-meta text-ink-2">
                      {counts.get(c.slug) ?? 0} to {mode}
                    </span>
                  )}
                </span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-transform duration-200 ease-out group-hover/cat:translate-x-0.5 md:size-10">
                  <ArrowRight
                    className="size-4"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PickupMap({ mode, wantedCount }: { mode: Mode; wantedCount: number }) {
  const count = (slug: string) =>
    mode === "request"
      ? null
      : itemsFor(mode).filter((item) => item.spot === slug).length;
  return (
    <section className="container">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-end lg:gap-10">
        <div>
          <h2 className="t-h2">Pick up near you</h2>
          <p className="t-body mt-4 text-ink-2">
            Every handoff happens at a public spot on campus. Choose the one on
            your way to class.
          </p>
          {mode === "request" && (
            <p className="t-meta mt-4 text-ink-2">
              {wantedCount} open requests across campus
            </p>
          )}
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-tile bg-surface sm:aspect-[16/9]">
          <CampusMap
            pins={spots.map((spot) => ({
              slug: spot.slug,
              name: spot.name,
              lat: spot.lat,
              lng: spot.lng,
              side: spot.labelSide,
              href: `/marketplace/browse?mode=${mode}&spot=${spot.slug}`,
              count: count(spot.slug),
            }))}
          />
        </div>
      </div>
    </section>
  );
}

/** One wide editorial tile. The countdown shows only in March and April. */
function MoveOut() {
  const now = new Date();
  const month = now.getMonth();
  const inSeason = month === 2 || month === 3;
  const days = Math.max(
    0,
    Math.ceil(
      (new Date(`${MOVE_OUT_DATE}T00:00:00`).getTime() - now.getTime()) /
        86_400_000,
    ),
  );
  return (
    <section className="container">
      <div className="relative grid grid-cols-[minmax(0,1fr)] gap-8 rounded-tile bg-surface px-6 py-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-end md:px-12 md:py-16">
        <div>
          <p className="t-label text-ink-2">Seasonal</p>
          <h2 className="t-statement mt-4">Move-out sale, April</h2>
          <p className="t-body mt-5 text-ink-2">
            When residences empty out, fridges, desks and kettles go to
            classmates staying on, not the dumpster. Reserve now and pick up on
            move-out day.
          </p>
          <Link
            href="/marketplace/move-out"
            className={cn(buttonVariants({ size: "lg" }), "mt-8")}
          >
            See move-out finds
          </Link>
        </div>
        {inSeason ? (
          <p className="flex flex-col md:items-end">
            <span className="t-statement num">{days}</span>
            <span className="t-label mt-2 text-ink-2">days until move-out</span>
          </p>
        ) : (
          <p className="flex flex-col md:items-end md:text-right">
            <span className="t-statement num">
              {new Date(`${MOVE_OUT_DATE}T00:00:00`).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              )}
            </span>
            <span className="t-label mt-2 text-ink-2">Next move-out day</span>
            <span className="t-body mt-1 text-ink-2">
              Reservations open in March
            </span>
          </p>
        )}
        <Sticker
          variant="pill"
          fill="holo"
          rotate={-8}
          className="absolute -top-5 right-4 md:top-10 md:right-12"
        >
          Move-out ready
        </Sticker>
      </div>
    </section>
  );
}
