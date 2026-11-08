import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DepositDemo } from "@/components/deposits/deposit-demo";
import { getListing, getProfile, rentalRequests } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Deposit demo" };

export default function DepositsPage({
  searchParams,
}: PageProps<"/marketplace/deposits">) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-10">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl">Rental deposit</h1>
        <span className="rounded-pill border border-rule px-2.5 py-0.5 text-xs font-medium text-ink-2">
          Solana Devnet
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        A simulation of sending a rental deposit as a Devnet SOL transfer. No
        wallet is connected and no transaction is sent. Devnet tokens have no
        monetary value. This is a direct wallet-to-wallet transfer (not escrow),
        and it&apos;s separate from the borrowing request itself.
      </p>
      <Suspense
        fallback={
          <div
            className="mt-8 h-72 animate-pulse motion-reduce:animate-none rounded-card bg-muted"
            aria-busy="true"
          />
        }
      >
        <DepositForRequest searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DepositForRequest({
  searchParams,
}: Pick<PageProps<"/marketplace/deposits">, "searchParams">) {
  const { request: requestId } = await searchParams;
  // No ?request= shows the first sample request; an unknown id is a 404, not a different item.
  const request = requestId
    ? rentalRequests.find((r) => r.id === requestId)
    : rentalRequests[0];
  if (!request) notFound();
  const listing = getListing(request.listingId);
  const owner = listing ? getProfile(listing.ownerId) : undefined;
  if (!listing || !owner) return null;

  return (
    <DepositDemo
      itemTitle={listing.title}
      ownerName={owner.displayName}
      depositUsd={listing.depositAmount ?? 0}
      dates={{ start: request.startDate, end: request.endDate }}
    />
  );
}
