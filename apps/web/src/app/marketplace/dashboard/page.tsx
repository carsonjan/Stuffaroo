import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ListingThumb } from "@/components/marketplace/listing-thumb";
import { AvailabilityBadge } from "@/components/marketplace/status-badge";
import { RequestRow } from "@/components/requests/request-row";
import { buttonVariants } from "@/components/ui/button";
import { WantedCard } from "@/components/wanted/wanted-card";
import { formatMoney, formatPrice } from "@/lib/format";
import {
  CURRENT_USER_ID,
  listings,
  rentalRequests,
  wantedPosts,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const myListings = listings.filter((l) => l.ownerId === CURRENT_USER_ID);
  const myListingIds = new Set(myListings.map((l) => l.id));
  const incoming = rentalRequests.filter((r) => myListingIds.has(r.listingId));
  const outgoing = rentalRequests.filter(
    (r) => r.borrowerId === CURRENT_USER_ID,
  );
  const pendingIncoming = incoming.filter((r) => r.status === "pending");
  const upcomingBorrows = outgoing.filter(
    (r) => r.status === "accepted" || r.status === "active",
  );
  const myWanted = wantedPosts.filter((w) => w.userId === CURRENT_USER_ID);
  const lendsCompleted = incoming.filter(
    (r) => r.status === "completed",
  ).length;

  const stats = [
    { label: "Requests to review", value: pendingIncoming.length },
    { label: "Upcoming borrows", value: upcomingBorrows.length },
    {
      label: "Active listings",
      value: myListings.filter((l) => l.availability === "available").length,
    },
    { label: "Lends completed", value: lendsCompleted },
  ];

  return (
    <div className="flex flex-col gap-12">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className="mt-1 font-display text-2xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <SectionHeader
          title="Needs your response"
          href="/marketplace/dashboard/requests"
          linkLabel="All requests"
        />
        {pendingIncoming.length > 0 ? (
          <ul className="divide-y rounded-card border bg-card">
            {pendingIncoming.map((r) => (
              <RequestRow key={r.id} request={r} perspective="owner" />
            ))}
          </ul>
        ) : (
          <p className="rounded-card border border-dashed p-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        )}
      </section>

      <section>
        <SectionHeader
          title="Your upcoming borrows"
          href="/marketplace/dashboard/requests?tab=outgoing"
          linkLabel="View all"
        />
        <ul className="divide-y rounded-card border bg-card">
          {upcomingBorrows.map((r) => (
            <RequestRow key={r.id} request={r} perspective="borrower" />
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your listings</h2>
          <Link
            href="/marketplace/listings/new"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "px-3",
            )}
          >
            <Plus data-icon="inline-start" /> New listing
          </Link>
        </div>
        <div className="overflow-hidden rounded-card border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Item</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                  Price
                </th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                  Deposit
                </th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {myListings.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/marketplace/listings/${l.id}`}
                      className="flex items-center gap-3 hover:text-ink-2"
                    >
                      <ListingThumb
                        category={l.category}
                        size="sm"
                        className="size-10"
                      />
                      <span className="font-medium">{l.title}</span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {formatPrice(l.pricePerDay)}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {formatMoney(l.depositAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <AvailabilityBadge status={l.availability} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Your wanted posts"
          href="/marketplace/wanted/new"
          linkLabel="Post another"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {myWanted.map((w) => (
            <WantedCard key={w.id} post={w} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Link
        href={href}
        className="rounded-small text-sm whitespace-nowrap text-ink-3 underline-offset-4 hover:text-ink-2 hover:underline"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
