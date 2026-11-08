"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { daysBetween, formatDateRange } from "@/lib/format";
import type { Listing } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-field border border-input bg-paper-2 px-4 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** Mockup only: submitting shows the confirmation state without saving anything. */
export function RequestForm({ listing }: { listing: Listing }) {
  const [start, setStart] = useState("2026-11-14");
  const [end, setEnd] = useState("2026-11-16");
  const [submitted, setSubmitted] = useState(false);

  const validRange = Boolean(start && end && end >= start);
  const days = validRange ? daysBetween(start, end) : 0;
  const rentalTotal = (listing.pricePerDay ?? 0) * days;

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-card bg-paper-2 p-5 text-center">
        <CircleCheck className="size-8 text-accent" aria-hidden />
        <p className="mt-3 font-medium">Request sent</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDateRange(start, end)}. You&apos;ll get a notification when the
          owner responds.
        </p>
        <p className="mt-2 text-xs text-muted-foreground italic">
          Mockup: nothing was sent.
        </p>
        <Link
          href="/dashboard/requests"
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
        event.preventDefault();
        if (validRange) setSubmitted(true);
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start">From</Label>
          <input
            id="start"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end">Until</Label>
          <input
            id="end"
            type="date"
            value={end}
            min={start}
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
          rows={3}
          placeholder="Say hi and mention when you could pick it up."
        />
      </div>

      {validRange && (
        <dl className="flex flex-col gap-1.5 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {listing.pricePerDay === null
                ? "Borrowing"
                : `$${listing.pricePerDay} × ${days} ${days === 1 ? "day" : "days"}`}
            </dt>
            <dd>{listing.pricePerDay === null ? "Free" : `$${rentalTotal}`}</dd>
          </div>
          {listing.depositAmount !== null && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Refundable deposit</dt>
              <dd>${listing.depositAmount}</dd>
            </div>
          )}
        </dl>
      )}

      <Button type="submit" size="lg" className="h-11" disabled={!validRange}>
        Request to borrow
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Nothing is due until the owner accepts.
      </p>
    </form>
  );
}
