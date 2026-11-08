import type { Metadata } from "next";

import { SectionHead } from "@/components/marketplace/section-head";
import { MoveOutDays } from "@/components/shop/move-out-countdown";
import { BuyCard } from "@/components/shop/shop-cards";
import { buyListings } from "@/lib/mock-shop";

export const metadata: Metadata = { title: "Move-out" };

/** April pickups first, then the rest. */
const reservable = [...buyListings].sort(
  (a, b) => Number(b.pickup.includes("Apr")) - Number(a.pickup.includes("Apr")),
);

export default function MoveOutPage() {
  return (
    <>
      <section className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-10">
        <div className="bento grid grid-cols-[minmax(0,1fr)] items-center gap-8 p-8 sm:p-12 md:grid-cols-[auto_minmax(0,1fr)]">
          <p className="text-[6rem] leading-none tracking-[-0.06em] text-ink sm:text-[8rem]">
            <MoveOutDays />
          </p>
          <div>
            <h1 className="text-[2.5rem] leading-[1.05] text-ink sm:text-[3.5rem]">
              Days until April move-out
            </h1>
            <p className="mt-4 max-w-[46ch] text-lg leading-[1.65] text-ink-3">
              Reserve stuff from graduating students now, pick it up when they
              move out.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-[120px] max-w-[1200px] px-4 sm:px-10">
        <SectionHead
          title="Reserve for move-out"
          sub="Pickup dates are set by each seller."
        />
        <div className="mt-10 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
          {reservable.map((item) => (
            <BuyCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}
