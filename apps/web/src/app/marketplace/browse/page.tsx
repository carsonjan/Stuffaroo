import { X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FilterPanel } from "@/components/browse/filter-panel";
import { FiltersSheet } from "@/components/browse/filters-sheet";
import { SortMenu } from "@/components/browse/sort-menu";
import { ListingTile, RequestTile } from "@/components/ds/listing-tile";
import { ModeToggle } from "@/components/ds/mode-toggle";
import { RooStickerStatic } from "@/components/ds/roo-sticker-static";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, getListings, getWantedPosts } from "@/lib/api";
import type { ListingDetail, WantedPost } from "@/lib/api-types";
import {
  activeFilters,
  type BrowseFilters,
  browseHref,
  filterItems,
  filterRequests,
  fromApi,
  nearestFrom,
  parseFilters,
  type Sort,
  sortItems,
  sorts,
  withoutApiDuplicates,
} from "@/lib/browse";
import {
  catalog,
  getSpot,
  type Mode,
  modes,
  sampleRequests,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Browse" };

const gridClass =
  "grid grid-cols-2 gap-x-3.5 gap-y-8 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4";

export default function BrowsePage({
  searchParams,
}: PageProps<"/marketplace/browse">) {
  return (
    <Suspense fallback={<BrowseSkeleton />}>
      <Browse searchParams={searchParams} />
    </Suspense>
  );
}

function BrowseSkeleton() {
  return (
    <div className="container pt-6 md:pt-10" aria-busy="true">
      <div className="h-9 w-48 rounded-pill bg-surface" />
      <div className="mt-6 h-12 w-80 max-w-full rounded-pill bg-surface" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="hidden h-96 rounded-card bg-surface lg:block" />
        <div className={gridClass}>
          {Array.from({ length: 8 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
            <div key={i} className="aspect-[4/5] rounded-thumb bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function loadListings(
  f: BrowseFilters,
): Promise<{ listings: ListingDetail[]; failed: boolean }> {
  try {
    const q = [f.q, f.course].filter(Boolean).join(" ");
    return {
      listings: await getListings({ q, category: f.category ?? undefined }),
      failed: false,
    };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { listings: [], failed: true };
  }
}

async function loadWanted(): Promise<WantedPost[]> {
  try {
    const posts = await getWantedPosts();
    return posts.length > 0 ? posts : sampleRequests();
  } catch {
    return sampleRequests();
  }
}

async function Browse({
  searchParams,
}: Pick<PageProps<"/marketplace/browse">, "searchParams">) {
  const f = parseFilters(await searchParams);
  const [{ listings, failed }, wanted] = await Promise.all([
    loadListings(f),
    loadWanted(),
  ]);
  const now = new Date();

  // Catalog items are matched locally; API listings were already matched on q by the API.
  // Demo items that duplicate a real API listing (same first two words) give way to it.
  const pool = [
    ...withoutApiDuplicates(catalog, listings).map((item) => ({
      item,
      textFiltered: false,
    })),
    ...listings.map((l) => ({ item: fromApi(l, now), textFiltered: true })),
  ];
  const itemsFor = (mode: Mode | null) =>
    sortItems(filterItems(pool, { ...f, mode }, now), f);
  const requests = filterRequests(wanted, f);

  const counts: Record<Mode, number> = {
    buy: itemsFor("buy").length,
    rent: itemsFor("rent").length,
    request: requests.length,
  };
  const items = f.mode === "request" ? [] : itemsFor(f.mode);
  const total = f.mode === "request" ? requests.length : items.length;
  const pills = activeFilters(f);
  const filterCount = pills.filter((p) => p.key !== "q").length;

  const sortHrefs = Object.fromEntries(
    sorts.map((s) => [s.key, browseHref(f, { sort: s.key })]),
  ) as Record<Sort, string>;

  return (
    <div className="container pt-6 md:pt-10">
      <div className="flex flex-col gap-2">
        <p className="t-label text-ink-2">
          {f.mode === "request" ? "Requests" : "Browse"}
        </p>
        <h1 className="t-h2">
          {f.q
            ? `Results for “${f.q}”`
            : f.mode === "request"
              ? "Wanted by classmates"
              : f.mode === "rent"
                ? "Rent from classmates"
                : f.mode === "buy"
                  ? "Buy from classmates"
                  : "Buy and rent on campus"}
        </h1>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 md:mt-8">
        <ModeToggle
          active={f.mode}
          counts={counts}
          hrefs={
            Object.fromEntries(
              modes.map(({ key }) => [
                key,
                browseHref(f, { mode: f.mode === key ? null : key }),
              ]),
            ) as Record<Mode, string>
          }
        />
        <div className="ml-auto flex items-center gap-2">
          <FiltersSheet count={filterCount} results={total}>
            <FilterPanel filters={f} idPrefix="sheet" />
          </FiltersSheet>
          {f.mode !== "request" && (
            <SortMenu
              active={f.sort}
              hrefs={sortHrefs}
              nearestLabel={`Nearest to ${getSpot(nearestFrom(f)).name}`}
            />
          )}
        </div>
      </div>

      {pills.length > 0 && (
        <ul
          className="mt-4 flex flex-wrap items-center gap-2"
          aria-label="Active filters"
        >
          {pills.map((pill) => (
            <li key={pill.key}>
              <Link
                href={pill.href}
                scroll={false}
                className="t-label press flex h-8 items-center gap-1.5 rounded-pill bg-surface pr-2.5 pl-3.5 text-ink transition-colors duration-200 hover:bg-surface-2"
              >
                {pill.label}
                <X className="size-3.5" strokeWidth={1.75} aria-hidden />
                <span className="visually-hidden">Remove filter</span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={browseHref(f, {
                q: "",
                course: "",
                category: null,
                condition: null,
                spot: null,
                min: null,
                max: null,
                free: false,
                date: null,
              })}
              scroll={false}
              className="t-label flex h-8 items-center px-2 text-ink-2 underline-offset-4 hover:text-ink hover:underline"
            >
              Clear all
            </Link>
          </li>
        </ul>
      )}

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside
          aria-label="Filters"
          className="hidden self-start lg:sticky lg:top-[140px] lg:block"
        >
          <FilterPanel filters={f} idPrefix="rail" />
        </aside>

        <section aria-live="polite" aria-label="Results">
          <p className="t-meta mb-5 text-ink-2">
            {total} {total === 1 ? "result" : "results"}
            {failed && " · Some listings couldn’t load right now"}
          </p>
          {total === 0 ? (
            <EmptyState f={f} />
          ) : f.mode === "request" ? (
            <ul key="request" className={cn(gridClass, "settle-in")}>
              {requests.map((post) => (
                <li key={post.id}>
                  <RequestTile post={post} />
                </li>
              ))}
            </ul>
          ) : (
            <ul key={f.mode ?? "all"} className={cn(gridClass, "settle-in")}>
              {items.map((item) => (
                <li key={item.id}>
                  <ListingTile item={item} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({ f }: { f: BrowseFilters }) {
  return (
    <div className="flex flex-col items-center rounded-tile bg-surface px-6 py-16 text-center md:py-24">
      <RooStickerStatic rotate={-6} size={96} />
      <p className="t-statement mt-8 text-center">Roo couldn’t find that.</p>
      <p className="t-body mt-4 text-ink-2">
        {f.mode === "request"
          ? "No classmates are asking for this yet."
          : "Ask for it and classmates who have one will see your request."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {f.mode !== "request" && (
          <Link
            href="/marketplace/wanted/new"
            className={buttonVariants({ variant: "brand", size: "lg" })}
          >
            Ask for it
          </Link>
        )}
        <Link
          href={browseHref(f, {
            q: "",
            course: "",
            category: null,
            condition: null,
            spot: null,
            min: null,
            max: null,
            free: false,
            date: null,
          })}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Clear filters
        </Link>
      </div>
    </div>
  );
}
