import { BadgeCheck, MapPin, ShieldCheck, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { ApiErrorState } from "@/components/api-error-state";
import { DemoRequest } from "@/components/detail/demo-request";
import { Gallery } from "@/components/detail/gallery";
import { ListingTile } from "@/components/ds/listing-tile";
import { Rail } from "@/components/ds/rail";
import { RequestForm } from "@/components/requests/request-form";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, getListing } from "@/lib/api";
import { availabilityLabel, getSpot } from "@/lib/catalog";
import { getCategory } from "@/lib/categories";
import { isoDateAfter } from "@/lib/format";
import {
  type DetailListing,
  detailTitle,
  loadDetail,
  moreFromSeller,
  pickupSlots,
  relatedPool,
  similarNearby,
} from "@/lib/listing-detail";
import { percentOff } from "@/lib/mock-shop";
import { cn } from "@/lib/utils";
import { getViewer } from "@/lib/viewer";

export async function generateMetadata({
  params,
}: PageProps<"/marketplace/listings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const demo = detailTitle(id);
  if (demo) return { title: demo };
  try {
    return { title: (await getListing(id))?.title ?? "Listing" };
  } catch {
    return { title: "Listing" };
  }
}

export default function ListingPage({
  params,
  searchParams,
}: PageProps<"/marketplace/listings/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ListingDetailView params={params} searchParams={searchParams} />
    </Suspense>
  );
}

function DetailSkeleton() {
  return (
    <div className="container pt-6 md:pt-10" aria-busy="true">
      <div className="h-4 w-40 rounded-pill bg-surface" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="aspect-[4/5] rounded-tile bg-surface lg:aspect-square" />
        <div className="h-96 rounded-card bg-surface" />
      </div>
    </div>
  );
}

async function ListingDetailView({
  params,
  searchParams,
}: PageProps<"/marketplace/listings/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  // Pickup slots and "listed" are relative to today, so render at request time.
  await connection();
  const now = new Date();

  let d: DetailListing | null;
  try {
    d = await loadDetail(id, now);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return (
      <div className="container pt-10">
        <ApiErrorState detail={error.detail} />
      </div>
    );
  }
  if (!d) notFound();

  const pool = await relatedPool(now);
  const fromSeller = moreFromSeller(pool, d);
  const similar = similarNearby(pool, d);

  const { item, seller, alt } = d;
  const as = Array.isArray(query.as) ? query.as[0] : query.as;
  // The Buy / Rent toggle shows when the item has both offers; ?as= picks one.
  const offer =
    alt && as === alt.mode
      ? { ...alt, originalPrice: undefined }
      : {
          mode: item.mode,
          price: item.price,
          unit: item.unit,
          deposit: item.deposit,
          originalPrice: item.originalPrice,
        };
  const category = getCategory(item.category);
  const place = item.spot ? getSpot(item.spot).name : (item.place ?? "Campus");
  const href = `/marketplace/listings/${item.id}`;

  return (
    <div className="container pt-6 md:pt-10">
      <nav aria-label="Breadcrumb" className="t-label flex gap-2 text-ink-2">
        <Link href="/marketplace/browse" className="hover:text-ink">
          Browse
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/marketplace/browse?category=${item.category}`}
          className="hover:text-ink"
        >
          {category?.name}
        </Link>
      </nav>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-8 md:mt-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-12">
          <Gallery
            photos={item.photos}
            title={item.title}
            category={item.category}
          />
          <About d={d} place={place} className="hidden lg:block" />
        </div>

        {/* Sticky panel */}
        <aside className="flex flex-col gap-6 self-start lg:sticky lg:top-[136px]">
          <div className="flex flex-col gap-3">
            <p className="t-meta text-ink-2">
              {place} · {availabilityLabel(item.availability, now)}
            </p>
            <h1 className="t-h2">{item.title}</h1>
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[2.25rem] leading-none font-normal tracking-[-0.025em] tabular-nums">
                {offer.price === 0 ? "Free" : `$${offer.price}`}
                {offer.unit && offer.price > 0 && (
                  <span className="t-unit text-[1rem]">/{offer.unit}</span>
                )}
              </span>
              {offer.originalPrice && offer.originalPrice > offer.price && (
                <>
                  <span className="text-[0.875rem] font-light text-ink-3 line-through">
                    <span className="visually-hidden">was </span>$
                    {offer.originalPrice}
                  </span>
                  {offer.price > 0 && (
                    <span className="t-meta text-deal">
                      -{percentOff(offer.price, offer.originalPrice)}%
                    </span>
                  )}
                </>
              )}
            </p>
            {offer.deposit !== undefined && (
              <p className="text-[0.875rem] font-light text-ink-2">
                Plus a ${offer.deposit} deposit, returned when the item comes
                back.
              </p>
            )}
          </div>

          {alt && (
            <nav
              aria-label="Buy or rent"
              className="flex w-fit rounded-pill bg-surface p-1"
            >
              {(["buy", "rent"] as const).map((m) => {
                const active = offer.mode === m;
                return (
                  <Link
                    key={m}
                    href={m === item.mode ? href : `${href}?as=${m}`}
                    scroll={false}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "t-label flex h-10 items-center rounded-pill px-5 transition-colors duration-200",
                      active
                        ? "bg-roo text-ink"
                        : "text-ink hover:bg-surface-2",
                    )}
                  >
                    {m === "buy" ? "Buy" : "Rent"}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex flex-col gap-2">
            <p className="t-label text-ink">Pickup</p>
            <p className="flex items-center gap-2 text-[0.9375rem]">
              <MapPin
                className="size-4 text-ink-2"
                strokeWidth={1.5}
                aria-hidden
              />
              {place}
            </p>
          </div>

          <Action d={d} offerMode={offer.mode} place={place} now={now} />

          <SellerCard d={d} />

          <p className="flex gap-2.5 text-[0.8125rem] font-light text-ink-2">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0"
              strokeWidth={1.5}
              aria-hidden
            />
            Meet at a public campus spot and check the item together before you
            pay.
          </p>
        </aside>

        <About d={d} place={place} className="lg:hidden" />
      </div>

      {fromSeller.length > 0 && (
        <Rail
          title={`More from ${seller.name.split(" ")[0]}`}
          allHref={`/marketplace/browse?q=${encodeURIComponent(seller.name.split(" ")[0])}`}
          allLabel="See all"
          className="mt-[var(--section-gap)] px-0"
        >
          {fromSeller.map((i) => (
            <ListingTile key={i.id} item={i} />
          ))}
        </Rail>
      )}
      {similar.length > 0 && (
        <Rail
          title="Similar nearby"
          allHref={`/marketplace/browse?category=${item.category}&sort=nearest${item.spot ? `&spot=${item.spot}` : ""}`}
          className="mt-[var(--section-gap)] px-0"
        >
          {similar.map((i) => (
            <ListingTile key={i.id} item={i} />
          ))}
        </Rail>
      )}
    </div>
  );
}

/** The primary action: the real request form for API listings, the demo flow otherwise. */
async function Action({
  d,
  offerMode,
  place,
  now,
}: {
  d: DetailListing;
  offerMode: "buy" | "rent";
  place: string;
  now: Date;
}) {
  const firstName = d.seller.name.split(" ")[0];
  if (!d.api) {
    return (
      <DemoRequest
        slots={pickupSlots(d.item, now)}
        cta={
          offerMode === "buy"
            ? "Buy this"
            : d.item.price === 0
              ? "Borrow this"
              : "Rent this"
        }
        sellerFirstName={firstName}
        spotName={place}
      />
    );
  }

  const listing = d.api;
  const viewer = await getViewer();
  if (viewer.status === "signed-in" && viewer.profile?.id === listing.ownerId) {
    return (
      <div className="rounded-card bg-surface p-5">
        <p className="t-h3">This is your listing</p>
        <Link
          href="/marketplace/dashboard"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "mt-4 w-full",
          )}
        >
          Manage in dashboard
        </Link>
      </div>
    );
  }
  if (listing.availability !== "available") {
    return (
      <div className="rounded-card bg-surface p-5">
        <p className="t-h3">Not available right now</p>
        <p className="mt-2 text-[0.875rem] font-light text-ink-2">
          Ask for it and classmates with something similar will see your
          request.
        </p>
        <Link
          href="/marketplace/wanted/new"
          className={cn(
            buttonVariants({ variant: "brand", size: "lg" }),
            "mt-4 w-full",
          )}
        >
          Ask for it
        </Link>
      </div>
    );
  }
  if (viewer.status !== "signed-in") {
    return (
      <SignInPrompt
        status={viewer.status}
        returnTo={`/marketplace/listings/${listing.id}`}
        title={`Sign in to ${listing.pricePerDayCents === null ? "borrow" : "rent"} this`}
        description="Requests go to the owner from your account, so sign in first."
      />
    );
  }
  return (
    <RequestForm
      listing={listing}
      minDate={isoDateAfter(now, 0)}
      defaultStart={isoDateAfter(now, 1)}
      defaultEnd={isoDateAfter(now, 3)}
    />
  );
}

function SellerCard({ d }: { d: DetailListing }) {
  const { seller } = d;
  const body = (
    <>
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[0.875rem] font-medium"
        aria-hidden
      >
        {seller.initials}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[1rem] font-medium">{seller.name}</span>
          <span className="t-label flex items-center gap-1 text-ok">
            <BadgeCheck className="size-3.5" strokeWidth={1.75} aria-hidden />
            Verified UBC
          </span>
        </span>
        <span className="truncate text-[0.8125rem] font-light text-ink-2">
          {seller.faculty}
        </span>
        <span className="t-meta flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-2">
          {seller.rating !== null ? (
            <span className="flex items-center gap-1 text-ink">
              <Star className="size-3 fill-ink" strokeWidth={0} aria-hidden />
              {seller.rating.toFixed(1)}
            </span>
          ) : (
            <span>
              {seller.handoffs} {seller.handoffs === 1 ? "handoff" : "handoffs"}
            </span>
          )}
          {seller.responseTime && (
            <>
              <span aria-hidden>·</span>
              <span>{seller.responseTime}</span>
            </>
          )}
        </span>
      </span>
    </>
  );
  const className =
    "flex items-center gap-4 rounded-card bg-surface p-4 transition-colors duration-200";
  return seller.profileHref ? (
    <Link
      href={seller.profileHref}
      className={cn(className, "hover:bg-surface-2")}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function About({
  d,
  place,
  className,
}: {
  d: DetailListing;
  place: string;
  className?: string;
}) {
  const { item } = d;
  const rows: [string, string][] = [
    ["Condition", item.condition],
    ["Category", getCategory(item.category)?.name ?? item.category],
    ["Pickup", place],
    [
      "Listed",
      item.listedDaysAgo === 0
        ? "Today"
        : item.listedDaysAgo === 1
          ? "Yesterday"
          : `${item.listedDaysAgo} days ago`,
    ],
  ];
  return (
    <section className={cn("min-w-0", className)}>
      <h2 className="t-h3">About this item</h2>
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-5 sm:grid-cols-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="t-meta font-normal text-ink-2">{label}</dt>
            <dd className="text-[0.9375rem]">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="t-body mt-5 text-ink">{d.description}</p>
    </section>
  );
}
