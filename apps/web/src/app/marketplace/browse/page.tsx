import { Search, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ApiErrorState } from "@/components/api-error-state";
import { ListingCard } from "@/components/marketplace/listing-card";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, getListings } from "@/lib/api";
import type { ListingDetail } from "@/lib/api-types";
import { categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Browse" };

const priceFilters = [
  { value: "", label: "Any price" },
  { value: "free", label: "Free to borrow" },
  { value: "5", label: "Under $5/day" },
  { value: "10", label: "Under $10/day" },
] as const;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default function MarketplacePage({
  searchParams,
}: PageProps<"/marketplace/browse">) {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <MarketplaceBrowser searchParams={searchParams} />
    </Suspense>
  );
}

function MarketplaceSkeleton() {
  return (
    <div
      className="mx-auto max-w-[1200px] px-4 py-10 sm:px-10"
      aria-busy="true"
    >
      <div className="h-9 w-72 animate-pulse motion-reduce:animate-none rounded-small bg-muted" />
      <div className="mt-8 grid gap-8 md:grid-cols-[200px_1fr]">
        <div className="hidden h-80 animate-pulse motion-reduce:animate-none rounded-card bg-muted md:block" />
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-10 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
              key={i}
              className="aspect-[4/5] animate-pulse motion-reduce:animate-none rounded-card bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

async function MarketplaceBrowser({
  searchParams,
}: Pick<PageProps<"/marketplace/browse">, "searchParams">) {
  const params = await searchParams;
  const q = firstValue(params.q).trim();
  const categoryParam = firstValue(params.category);
  const category = categories.some((c) => c.slug === categoryParam)
    ? categoryParam
    : "";
  const priceParam = firstValue(params.price);
  const price = priceFilters.some((p) => p.value === priceParam)
    ? priceParam
    : "";
  const showUnavailable = firstValue(params.all) === "1";

  let results: ListingDetail[] = [];
  let loadError: string | null = null;
  try {
    results = await getListings({
      q,
      category,
      price,
      includeUnavailable: showUnavailable,
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    loadError = error.detail;
  }

  const hrefWith = (next: Record<string, string>) => {
    const merged = {
      q,
      category,
      price,
      all: showUnavailable ? "1" : "",
      ...next,
    };
    const qs = new URLSearchParams(
      Object.entries(merged).filter(([, v]) => v),
    ).toString();
    return qs ? `/marketplace/browse?${qs}` : "/marketplace/browse";
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl">Browse the marketplace</h1>
          <p className="mt-1 text-muted-foreground">
            Borrow or rent from students on campus.
          </p>
        </div>
        <form
          action="/marketplace/browse"
          className="flex w-full items-center gap-2 rounded-field border border-rule-field bg-paper-2 px-4 focus-within:ring-3 focus-within:ring-ring/30 md:w-80"
        >
          {category && <input type="hidden" name="category" value={category} />}
          {price && <input type="hidden" name="price" value={price} />}
          {showUnavailable && <input type="hidden" name="all" value="1" />}
          <Search
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <label htmlFor="market-search" className="sr-only">
            Search items
          </label>
          <input
            id="market-search"
            name="q"
            defaultValue={q}
            placeholder="Search items"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[200px_1fr]">
        <aside className="flex flex-col gap-6" aria-label="Filters">
          <div>
            <h2 className="mb-2 text-sm font-medium text-ink-2">Category</h2>
            <div className="flex flex-wrap gap-1.5 md:flex-col md:gap-0.5">
              <FilterLink href={hrefWith({ category: "" })} active={!category}>
                All categories
              </FilterLink>
              {categories.map((c) => (
                <FilterLink
                  key={c.slug}
                  href={hrefWith({ category: c.slug })}
                  active={category === c.slug}
                >
                  {c.name}
                </FilterLink>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium text-ink-2">Price</h2>
            <div className="flex flex-wrap gap-1.5 md:flex-col md:gap-0.5">
              {priceFilters.map((p) => (
                <FilterLink
                  key={p.value}
                  href={hrefWith({ price: p.value })}
                  active={price === p.value}
                >
                  {p.label}
                </FilterLink>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium text-ink-2">
              Availability
            </h2>
            <FilterLink
              href={hrefWith({ all: showUnavailable ? "" : "1" })}
              active={showUnavailable}
            >
              Include on loan / paused
            </FilterLink>
          </div>
        </aside>

        <section aria-live="polite">
          {loadError !== null ? (
            <ApiErrorState detail={loadError} />
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {results.length} {results.length === 1 ? "item" : "items"}
                {q && <> for &ldquo;{q}&rdquo;</>}
              </p>
              {results.length > 0 ? (
                <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-10 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
                  {results.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-card border border-dashed px-6 py-16 text-center">
                  <SearchX
                    className="size-8 text-muted-foreground"
                    aria-hidden
                  />
                  <h2 className="mt-4 text-lg font-semibold">
                    Nothing listed yet
                  </h2>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Post a wanted request and we&apos;ll let students with
                    matching items know.
                  </p>
                  <div className="mt-5 flex gap-2">
                    <Link
                      href="/marketplace/wanted/new"
                      className={cn(buttonVariants({ size: "lg" }), "px-4")}
                    >
                      Post a wanted
                    </Link>
                    <Link
                      href="/marketplace/browse"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "px-4",
                      )}
                    >
                      Clear filters
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-small px-2.5 py-1.5 text-sm transition-colors max-md:border",
        active
          ? "bg-paper-3 font-medium text-ink-2 max-md:border-transparent"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
