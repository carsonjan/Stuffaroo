"use client";

import { useState } from "react";

import { RooStickerStatic } from "@/components/ds/roo-sticker-static";
import { Sticker } from "@/components/ds/sticker";
import { cn } from "@/lib/utils";

/**
 * Pickup slots and the primary action for a demo listing. Nothing is sent:
 * the demo has no seller to reach, so it shows the success screen locally.
 */
export function DemoRequest({
  slots,
  cta,
  sellerFirstName,
  spotName,
}: {
  slots: string[];
  cta: string;
  sellerFirstName: string;
  spotName: string;
}) {
  const [slot, setSlot] = useState(slots[0]);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="relative mt-2 flex flex-col items-center rounded-card bg-surface px-5 pt-16 pb-6 text-center">
        <RooStickerStatic
          size={72}
          rotate={-8}
          className="absolute -top-8 left-4"
        />
        <Sticker
          variant="pill"
          fill="lime"
          rotate={6}
          className="absolute -top-4 right-4"
        >
          Pickup on campus
        </Sticker>
        <p className="t-h3 mt-2">Sent to {sellerFirstName}</p>
        <p className="t-body mt-2 text-ink-2">
          {slot} at {spotName}. {sellerFirstName} confirms the time, then you
          meet and rate each other after the handoff.
        </p>
        <p className="t-meta mt-4 text-ink-3">Demo · nothing was sent</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="t-label mt-5 h-10 rounded-pill border border-ink/20 px-5 transition-colors duration-200 hover:border-ink"
        >
          Change time
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="t-label mb-3 text-ink">Pick a time</legend>
        <div className="flex flex-wrap gap-2">
          {slots.map((s) => (
            <label
              key={s}
              className={cn(
                "t-label flex h-10 cursor-pointer items-center rounded-pill px-4 transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                slot === s
                  ? "bg-ink text-white"
                  : "bg-surface text-ink hover:bg-surface-2",
              )}
            >
              <input
                type="radio"
                name="slot"
                value={s}
                checked={slot === s}
                onChange={() => setSlot(s)}
                className="sr-only"
              />
              {s}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        onClick={() => setSent(true)}
        className="t-label-lg h-12 w-full rounded-pill bg-roo text-ink transition-colors duration-200 hover:bg-roo-deep hover:text-white"
      >
        {cta}
      </button>
      <p className="-mt-2 text-center text-[0.75rem] font-light text-ink-2">
        Nothing is paid in the app. You pay {sellerFirstName} at pickup.
      </p>
    </div>
  );
}
