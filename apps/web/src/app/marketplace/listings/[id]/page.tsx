import { MapPin, ShieldCheck, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingCard } from "@/components/marketplace/listing-card";
import { ListingThumb } from "@/components/marketplace/listing-thumb";
import { AvailabilityBadge } from "@/components/marketplace/status-badge";
import { RequestForm } from "@/components/requests/request-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { formatMoney, formatPrice } from "@/lib/format";
import {
  CURRENT_USER_ID,
  getCategory,
  getListing,
  getProfile,
  listings,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return listings.map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/marketplace/listings/[id]">): Promise<Metadata> {
  const listing = getListing((await params).id);
  return { title: listing?.title ?? "Listing" };
}

export default async function ListingPage({
  params,
}: PageProps<"/marketplace/listings/[id]">) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  const owner = getProfile(listing.ownerId);
  const category = getCategory(listing.category);
  const isOwn = listing.ownerId === CURRENT_USER_ID;
  const similar = listings
    .filter(
      (l) =>
        l.category === listing.category &&
        l.id !== listing.id &&
        l.availability === "available",
    )
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-10">
      <Link
        href="/marketplace/browse"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        Back to browse
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <ListingThumb category={listing.category} size="lg" />
          <div className="mt-3 grid grid-cols-4 gap-3" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-small",
                  category?.tint,
                  i === 0 ? "ring-2 ring-ink-2 ring-offset-2" : "opacity-60",
                )}
              />
            ))}
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Link
                href={`/marketplace/browse?category=${listing.category}`}
                className="hover:text-foreground"
              >
                {category?.name}
              </Link>
              <AvailabilityBadge status={listing.availability} />
            </div>
            <h1 className="mt-3 text-2xl">{listing.title}</h1>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {listing.description}
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-card border bg-card p-5 sm:grid-cols-4">
              <Detail label="Price" value={formatPrice(listing.pricePerDay)} />
              <Detail
                label="Deposit"
                value={formatMoney(listing.depositAmount)}
              />
              <Detail label="Condition" value={listing.condition} />
              <Detail label="Pickup" value={listing.location} />
            </dl>
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold">
                {formatPrice(listing.pricePerDay)}
              </span>
              {listing.depositAmount !== null && (
                <span className="text-sm text-muted-foreground">
                  + {formatMoney(listing.depositAmount)} refundable deposit
                </span>
              )}
            </div>
            <div className="mt-5">
              {isOwn ? (
                <div className="border-t pt-4 text-sm">
                  <p className="font-medium">This is your listing</p>
                  <p className="mt-1 text-muted-foreground">
                    You can&apos;t request your own item.
                  </p>
                  <Link
                    href="/marketplace/dashboard"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "mt-3 w-full",
                    )}
                  >
                    Manage in dashboard
                  </Link>
                </div>
              ) : listing.availability === "available" ? (
                <RequestForm listing={listing} />
              ) : (
                <div className="border-t pt-4 text-sm text-muted-foreground">
                  This item isn&apos;t available right now. Post a wanted
                  request and we&apos;ll match you with similar items.
                  <Link
                    href="/marketplace/wanted/new"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "mt-3 w-full",
                    )}
                  >
                    Post a wanted
                  </Link>
                </div>
              )}
            </div>
          </div>

          {owner && (
            <Link
              href={`/marketplace/profile/${owner.id}`}
              className="flex items-center gap-3 rounded-card border bg-card p-4 transition-colors hover:border-rule-2"
            >
              <Avatar size="lg">
                <AvatarFallback className="bg-paper-3 font-medium text-ink-2">
                  {owner.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{owner.displayName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {owner.program}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="flex items-center justify-end gap-1 font-medium">
                  <Star
                    className="size-3.5 fill-ink-2 text-ink-2"
                    aria-hidden
                  />{" "}
                  {owner.rating.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {owner.completedLends} lends
                </p>
              </div>
            </Link>
          )}

          <div className="flex gap-3 rounded-card bg-paper-2 p-4 text-sm text-ink-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Meet somewhere public on campus. Check the item together at pickup
              and return.
            </p>
          </div>
          <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden /> Pickup around{" "}
            {listing.location}
          </p>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-xl font-semibold">
            More in {category?.name}
          </h2>
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-10 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
