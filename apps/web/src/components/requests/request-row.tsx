"use client";

import { Coins, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { ListingThumb } from "@/components/marketplace/listing-thumb";
import { RentalStatusBadge } from "@/components/marketplace/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { RentalAction, RentalRequest } from "@/lib/api-types";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { transitionRentalAction } from "./actions";

type Perspective = "owner" | "borrower";

type ActionButton = {
  action: RentalAction;
  label: string;
  variant: "default" | "outline";
};

/** The transitions docs/api-contract.md allows for this role and status. */
function allowedActions(
  perspective: Perspective,
  status: RentalRequest["status"],
): ActionButton[] {
  if (perspective === "owner") {
    if (status === "pending") {
      return [
        { action: "reject", label: "Decline", variant: "outline" },
        { action: "accept", label: "Accept", variant: "default" },
      ];
    }
    if (status === "accepted") {
      return [
        { action: "start", label: "Mark handed over", variant: "outline" },
      ];
    }
    if (status === "active") {
      return [
        { action: "complete", label: "Mark returned", variant: "outline" },
      ];
    }
    return [];
  }
  return status === "pending"
    ? [{ action: "cancel", label: "Cancel request", variant: "outline" }]
    : [];
}

/**
 * One rental request. Buttons call the API through a server action; the new
 * status arrives with the revalidated dashboard, so nothing changes until the
 * API has accepted the transition.
 */
export function RequestRow({
  request,
  perspective,
}: {
  request: RentalRequest;
  perspective: Perspective;
}) {
  const [isPending, startTransition] = useTransition();
  const [running, setRunning] = useState<RentalAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { listing } = request;
  const counterpart =
    perspective === "owner" ? request.borrower : listing.owner;
  const buttons = allowedActions(perspective, request.status);

  const run = (action: RentalAction) => {
    setError(null);
    setRunning(action);
    startTransition(async () => {
      const result = await transitionRentalAction(request.id, action);
      if (!result.ok) setError(result.message);
    });
  };

  return (
    <li className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 gap-4">
        <ListingThumb category={listing.category} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/marketplace/listings/${listing.id}`}
              className="truncate font-medium hover:text-ink-2"
            >
              {listing.title}
            </Link>
            <RentalStatusBadge status={request.status} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {perspective === "owner" ? "From" : "Owner:"}{" "}
            {counterpart.displayName},{" "}
            {formatDateRange(request.startDate, request.endDate)}
          </p>
          {request.message && (
            <p className="mt-2 line-clamp-2 text-sm">
              &ldquo;{request.message}&rdquo;
            </p>
          )}
          {error && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
        {buttons.map((button) => (
          <Button
            key={button.action}
            variant={button.variant}
            size="lg"
            className="px-3"
            disabled={isPending}
            aria-busy={(isPending && running === button.action) || undefined}
            onClick={() => run(button.action)}
          >
            {isPending && running === button.action && (
              <LoaderCircle
                className="animate-spin motion-reduce:animate-none"
                data-icon="inline-start"
              />
            )}
            {button.label}
          </Button>
        ))}
        {perspective === "borrower" &&
          request.status === "accepted" &&
          listing.depositCents !== null && (
            <Link
              href={`/marketplace/deposits?request=${request.id}`}
              className={cn(buttonVariants({ size: "lg" }), "px-3")}
            >
              <Coins data-icon="inline-start" /> Deposit demo
            </Link>
          )}
      </div>
    </li>
  );
}
