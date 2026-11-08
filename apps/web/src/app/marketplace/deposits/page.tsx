import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ApiErrorState } from "@/components/api-error-state";
import { DepositDemo } from "@/components/deposits/deposit-demo";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { ApiError, getRental, getRentals } from "@/lib/api";
import type { RentalRequest } from "@/lib/api-types";
import { getViewer } from "@/lib/viewer";

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
        A demonstration of sending a rental deposit as a Devnet SOL transfer.
        Devnet tokens have no monetary value. This is a direct wallet-to-wallet
        transfer (not escrow), and it&apos;s separate from the borrowing request
        itself.
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
  const viewer = await getViewer();
  if (viewer.status !== "signed-in") {
    return (
      <SignInPrompt
        status={viewer.status}
        returnTo="/marketplace/deposits"
        title="Sign in to see your deposits"
        description="The deposit demo uses one of your own accepted rental requests."
        className="mt-8"
      />
    );
  }

  const { request: requestParam } = await searchParams;
  const requestId = Array.isArray(requestParam)
    ? requestParam[0]
    : requestParam;
  let request: RentalRequest | null | undefined;
  try {
    if (requestId) {
      // Only the borrower or owner can load it; anyone else gets a 404.
      request = await getRental(requestId);
    } else {
      // Default to the viewer's own accepted or active borrow.
      request = (await getRentals("borrower")).find(
        (r) => r.status === "accepted" || r.status === "active",
      );
    }
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return (
      <div className="mt-8">
        <ApiErrorState detail={error.detail} />
      </div>
    );
  }
  if (requestId && !request) notFound();
  if (!request) {
    return (
      <p className="mt-8 rounded-card border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
        You don&apos;t have an accepted request yet. Once an owner accepts one,
        open it from your dashboard to try the deposit demo.
      </p>
    );
  }

  return (
    <DepositDemo
      itemTitle={request.listing.title}
      ownerName={request.listing.owner.displayName}
      depositCents={request.listing.depositCents}
      dates={{ start: request.startDate, end: request.endDate }}
    />
  );
}
