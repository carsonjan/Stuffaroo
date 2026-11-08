"use client";

import { Coins } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ListingThumb } from "@/components/marketplace/listing-thumb";
import { RentalStatusBadge } from "@/components/marketplace/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDateRange } from "@/lib/format";
import {
  getListing,
  getProfile,
  type RentalRequest,
  type RentalStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Mockup of the request lifecycle. Transitions only update local state here;
 * the real version validates every transition on the server.
 */
export function RequestRow({
  request,
  perspective,
}: {
  request: RentalRequest;
  perspective: "owner" | "borrower";
}) {
  const [status, setStatus] = useState<RentalStatus>(request.status);
  const listing = getListing(request.listingId);
  if (!listing) return null;

  const counterpart = getProfile(
    perspective === "owner" ? request.borrowerId : listing.ownerId,
  );

  return (
    <li className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 gap-4">
        <ListingThumb category={listing.category} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/listings/${listing.id}`}
              className="truncate font-medium hover:text-ink-2"
            >
              {listing.title}
            </Link>
            <RentalStatusBadge status={status} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {perspective === "owner" ? "From" : "Owner:"}{" "}
            {counterpart?.displayName},{" "}
            {formatDateRange(request.startDate, request.endDate)}
          </p>
          {request.message && (
            <p className="mt-2 line-clamp-2 text-sm">
              &ldquo;{request.message}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
        {perspective === "owner" && status === "pending" && (
          <>
            <Button
              variant="outline"
              size="lg"
              className="px-3"
              onClick={() => setStatus("rejected")}
            >
              Decline
            </Button>
            <Button
              size="lg"
              className="px-3"
              onClick={() => setStatus("accepted")}
            >
              Accept
            </Button>
          </>
        )}
        {perspective === "owner" && status === "accepted" && (
          <Button
            variant="outline"
            size="lg"
            className="px-3"
            onClick={() => setStatus("active")}
          >
            Mark handed over
          </Button>
        )}
        {perspective === "owner" && status === "active" && (
          <Button
            variant="outline"
            size="lg"
            className="px-3"
            onClick={() => setStatus("completed")}
          >
            Mark returned
          </Button>
        )}
        {perspective === "borrower" && status === "pending" && (
          <Button
            variant="outline"
            size="lg"
            className="px-3"
            onClick={() => setStatus("cancelled")}
          >
            Cancel request
          </Button>
        )}
        {perspective === "borrower" &&
          status === "accepted" &&
          listing.depositAmount !== null && (
            <Link
              href={`/deposits?request=${request.id}`}
              className={cn(buttonVariants({ size: "lg" }), "px-3")}
            >
              <Coins data-icon="inline-start" /> Deposit demo
            </Link>
          )}
      </div>
    </li>
  );
}
