import type { Metadata } from "next";

import { SectionHead } from "@/components/marketplace/section-head";
import { BundleCard, BuyCard, DropCard } from "@/components/shop/shop-cards";
import { bundles, buyListings, priceDrops } from "@/lib/mock-shop";

export const metadata: Metadata = { title: "Deals" };

export default function DealsPage() {
  return (
    <>
      <section className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-10">
        <h1 className="max-w-[16ch] text-display leading-[1.02] text-ink">
          Deals from classmates
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg leading-[1.65] text-ink-3">
          Price drops, end-of-term sales and dorm bundles, every discount worked
          out from the original price.
        </p>
      </section>

      <section className="mx-auto mt-[128px] max-w-[1200px] px-4 sm:px-10">
        <SectionHead
          title="Price drops soon"
          sub="Prices step down on a schedule the seller sets. Grab it now or wait for the next drop."
        />
        <div className="mt-10 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {priceDrops.map((item) => (
            <DropCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-[128px] max-w-[1200px] px-4 sm:px-10">
        <SectionHead
          title="On sale now"
          sub="Graduating students, priced to go."
        />
        <div className="mt-10 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
          {buyListings.map((item) => (
            <BuyCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-[128px] bg-[image:var(--blue-band)] px-4 py-[100px] sm:px-10">
        <div className="mx-auto max-w-[1200px]">
          <SectionHead
            title="Dorm bundles"
            sub="A room's worth of stuff in one pickup, for less than the parts."
          />
          <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))]">
            {bundles.map((item) => (
              <BundleCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
