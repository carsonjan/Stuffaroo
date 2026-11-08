import { CalendarClock, Sparkles, Tag } from "lucide-react";
import Link from "next/link";

import { CategoryIcon } from "@/components/marketplace/category-icon";
import { PromptBox } from "@/components/marketplace/prompt-box";
import { SectionHead } from "@/components/marketplace/section-head";
import { Roo } from "@/components/roo";
import { ModeSwitcher } from "@/components/shop/mode-switcher";
import { MoveOutDays } from "@/components/shop/move-out-countdown";
import { buttonVariants } from "@/components/ui/button";
import { categories, listings, wantedPosts } from "@/lib/mock-data";
import { priceDrops } from "@/lib/mock-shop";
import { cn } from "@/lib/utils";

const popular = ["camera", "tent", "keyboard", "textbook"];
const firstRequest = wantedPosts.find((post) => post.status === "open");

/** Nomu's quiet white pill: white fill, faint inner edge, ink-3 text. */
const softPill =
  "rounded-pill bg-paper-2 text-ink-3 shadow-[var(--interior-edge)] transition-colors duration-[120ms] hover:text-ink";

export default function HomePage() {
  return (
    <>
      {/* Hero: Roo asks, the search answers */}
      <section className="relative mx-auto flex min-h-[min(calc(100svh-132px),660px)] max-w-[1200px] flex-col items-center justify-center px-4 pt-0 pb-24 text-center sm:px-10">
        {/* Roo stands beside the search on wide screens, above the headline on narrow ones */}
        <div className="mb-5 flex items-end justify-center gap-3 lg:absolute lg:right-10 lg:bottom-16 lg:mb-0 lg:flex-col-reverse lg:items-end lg:gap-2">
          <Roo className="h-[120px] w-[100px] shrink-0 sm:h-[144px] sm:w-[120px] lg:mr-6 lg:h-[200px] lg:w-[166px]" />
          <p className="materialize relative mb-16 max-w-[220px] origin-bottom-left rounded-[20px] rounded-bl-[6px] bg-paper-2 px-4 py-2.5 text-left text-sm leading-snug text-ink shadow-float lg:mb-0 lg:origin-bottom-right lg:rounded-bl-[20px] lg:rounded-br-[6px]">
            G&apos;day! My pouch is full of stuff from your classmates.
          </p>
        </div>
        <h1 className="mx-auto max-w-[16ch] text-display leading-[1.02] text-ink">
          What can Roo find
          <br />
          <span className="text-signal-deep">for you today?</span>
        </h1>
        <p className="mx-auto mt-7 max-w-[42ch] text-lg leading-[1.65] text-ink-3">
          Stuff that hops between classmates, lent or sold on your campus.
        </p>
        <PromptBox
          id="hero-search"
          placeholder="Search items or course code, e.g. CPSC 310"
          className="mt-9 max-w-[640px]"
        />
        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-3">
          <Sparkles className="size-4 text-accent" aria-hidden />
          Or just describe it: &ldquo;a lamp for my dorm until April&rdquo;
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {popular.map((term) => (
            <Link
              key={term}
              href={`/marketplace/browse?q=${encodeURIComponent(term)}`}
              className={cn(softPill, "press px-4 py-1.5 text-sm")}
            >
              {term}
            </Link>
          ))}
        </div>
      </section>

      {/* Buy / Rent / Request, one grid */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-10">
        <ModeSwitcher />
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <Link
            href="/marketplace/browse"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "mr-2",
            )}
          >
            Browse the marketplace
          </Link>
          <nav className="flex flex-wrap gap-2" aria-label="Categories">
            {categories.map((category) => {
              const count = listings.filter(
                (l) => l.category === category.slug,
              ).length;
              return (
                <Link
                  key={category.slug}
                  href={`/marketplace/browse?category=${category.slug}`}
                  className={cn(
                    softPill,
                    "press flex items-center gap-2 py-2 pr-4 pl-3 text-sm",
                  )}
                >
                  <CategoryIcon
                    category={category.slug}
                    className="size-4 shrink-0"
                  />
                  {category.name}
                  <span className="text-steel">{count}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Each of these has its own page */}
      <section className="mx-auto mt-[144px] max-w-[1200px] px-4 sm:px-10">
        <SectionHead
          title="More around campus"
          sub="Deals, move-out finds and requests, each on its own page."
        />
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-[repeat(3,minmax(0,1fr))]">
          <Link
            href="/marketplace/deals"
            className="bento lift flex min-h-[240px] flex-col p-7"
          >
            <h3 className="mt-auto flex items-center gap-2 text-2xl leading-tight tracking-[-0.03em] text-ink">
              <Tag className="size-5 shrink-0 text-accent" aria-hidden /> Price
              drops soon
            </h3>
            <p className="mt-2 text-sm text-ink-3">
              {priceDrops[0].title}: ${priceDrops[0].price} now, $
              {priceDrops[0].nextPrice} {priceDrops[0].nextDropIn}.
            </p>
          </Link>
          <Link
            href="/marketplace/move-out"
            className="bento lift flex min-h-[240px] flex-col p-7"
          >
            <p className="mt-auto text-[3.5rem] leading-none tracking-[-0.05em] text-ink">
              <MoveOutDays />{" "}
              <span className="text-xl tracking-[-0.02em] text-ink-3">
                days
              </span>
            </p>
            <h3 className="mt-2 flex items-center gap-2 text-2xl leading-tight tracking-[-0.03em] text-ink">
              <CalendarClock
                className="size-5 shrink-0 text-accent"
                aria-hidden
              />{" "}
              Until April move-out
            </h3>
          </Link>
          <Link
            href="/marketplace/wanted"
            className="bento lift flex min-h-[240px] flex-col p-7"
          >
            <h3 className="mt-auto text-2xl leading-tight tracking-[-0.03em] text-ink">
              Classmates are looking for
            </h3>
            {firstRequest && (
              <p className="mt-2 text-sm text-ink-3">{firstRequest.title}</p>
            )}
          </Link>
        </div>
      </section>

      {/* Close: lend what you have */}
      <section className="mx-auto mt-[160px] flex max-w-[1200px] flex-col items-center px-4 text-center sm:px-10">
        <h2 className="mx-auto max-w-[20ch] text-[2.5rem] leading-[1.05] tracking-[-0.045em] text-ink sm:text-[3.75rem]">
          That tent you used once? Let it hop to someone this weekend.
        </h2>
        <p className="mx-auto mt-6 max-w-[44ch] text-lg leading-[1.65] text-ink-3">
          List it in under a minute. AI writes the description, you set the
          price and dates.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/marketplace/listings/new"
            className={buttonVariants({ size: "lg" })}
          >
            Post an item
          </Link>
          <Link
            href="/marketplace/wanted/new"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Post a request
          </Link>
        </div>
      </section>
    </>
  );
}
