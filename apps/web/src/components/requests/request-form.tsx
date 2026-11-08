"use client";

import { CircleCheck, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Listing } from "@/lib/api-types";
import { daysBetween, formatDateRange, formatMoneyCents } from "@/lib/format";
import { cn } from "@/lib/utils";
import { type RequestRentalState, requestRentalAction } from "./actions";

const inputClass =
  "h-11 w-full rounded-field border border-input bg-paper-2 px-4 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

const initialState: RequestRentalState = { status: "idle" };

/**
 * Sends a real request to the listing's owner. Dates default to a window
 * starting from `minDate` (today, computed on the server).
 */
export function RequestForm({
  listing,
  minDate,
  defaultStart,
  defaultEnd,
}: {
  listing: Listing;
  minDate: string;
  defaultStart: string;
  defaultEnd: string;
}) {
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [state, formAction, isPending] = useActionState(
    requestRentalAction,
    initialState,
  );
  const isFree = listing.pricePerDayCents === null;

  const validRange = Boolean(start && end && end >= start);
  const days = validRange ? daysBetween(start, end) : 0;
  const rentalTotalCents = (listing.pricePerDayCents ?? 0) * days;

  if (state.status === "sent") {
    const { request } = state;
    return (
      <div className="flex flex-col items-center rounded-card bg-paper-2 p-5 text-center">
        <CircleCheck className="size-8 text-accent" aria-hidden />
        <p className="mt-3 font-medium">Request sent</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDateRange(request.startDate, request.endDate)}. The owner can
          accept or decline it. Check its status in your dashboard.
        </p>
        <Link
          href="/marketplace/dashboard/requests"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "mt-4 w-full",
          )}
        >
          View my requests
        </Link>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        // Submit manually so React doesn't reset the form after the action.
        event.preventDefault();
        if (!validRange) return;
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
    >
      <input type="hidden" name="listingId" value={listing.id} />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start">From</Label>
          <input
            id="start"
            name="startDate"
            type="date"
            value={start}
            min={minDate}
            onChange={(e) => setStart(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end">Until</Label>
          <input
            id="end"
            name="endDate"
            type="date"
            value={end}
            min={start || minDate}
            onChange={(e) => setEnd(e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message to owner</Label>
        <Textarea
          id="message"
          name="message"
          maxLength={1000}
          rows={3}
          placeholder="Say hi and mention when you could pick it up."
        />
      </div>

      {validRange && (
        <dl className="flex flex-col gap-1.5 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {isFree
                ? "Borrowing"
                : `${formatMoneyCents(listing.pricePerDayCents)} × ${days} ${days === 1 ? "day" : "days"}`}
            </dt>
            <dd>{isFree ? "Free" : formatMoneyCents(rentalTotalCents)}</dd>
          </div>
          {listing.depositCents !== null && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Refundable deposit</dt>
              <dd>{formatMoneyCents(listing.depositCents)}</dd>
            </div>
          )}
        </dl>
      )}

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="h-11"
        disabled={!validRange || isPending}
        aria-busy={isPending || undefined}
      >
        {isPending && (
          <LoaderCircle
            className="animate-spin motion-reduce:animate-none"
            data-icon="inline-start"
          />
        )}
        {isPending
          ? "Sending request…"
          : isFree
            ? "Request to borrow"
            : "Request to rent"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Nothing is due until the owner accepts.
      </p>
    </form>
  );
}
