import Link from "next/link";

import { Logo } from "./logo";

const linkClass =
  "rounded-small text-sm whitespace-nowrap text-ink-3 underline-offset-4 transition-colors hover:text-ink hover:underline";

export function SiteFooter() {
  return (
    <footer className="mt-[160px] border-t border-pebble bg-paper-2">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-4 pt-16 pb-12 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-10">
        <div className="flex flex-col gap-4">
          <Link
            href="/marketplace"
            className="w-fit rounded-small"
            aria-label="Stuffaroo home"
          >
            <Logo hop className="text-[3.5rem]" />
          </Link>
          <p className="max-w-[32ch] text-sm text-ink-3">
            Stuff that hops between students. Buy less, share more.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(2,auto)] gap-x-12 gap-y-8 sm:grid-cols-[repeat(3,auto)]">
          <nav aria-label="Marketplace" className="flex flex-col gap-3">
            <h3 className="text-[13px] leading-5 font-semibold tracking-normal text-ink">
              Marketplace
            </h3>
            <Link href="/marketplace/browse" className={linkClass}>
              Browse
            </Link>
            <Link href="/marketplace/deals" className={linkClass}>
              Deals
            </Link>
            <Link href="/marketplace/move-out" className={linkClass}>
              Move-out
            </Link>
            <Link href="/marketplace/wanted" className={linkClass}>
              Wanted posts
            </Link>
          </nav>
          <nav aria-label="Post" className="flex flex-col gap-3">
            <h3 className="text-[13px] leading-5 font-semibold tracking-normal text-ink">
              Post
            </h3>
            <Link href="/marketplace/listings/new" className={linkClass}>
              Lend an item
            </Link>
            <Link href="/marketplace/wanted/new" className={linkClass}>
              Post a request
            </Link>
          </nav>
          <nav aria-label="Demo" className="flex flex-col gap-3">
            <h3 className="text-[13px] leading-5 font-semibold tracking-normal text-ink">
              Demo
            </h3>
            <Link href="/marketplace/deposits" className={linkClass}>
              Deposit demo
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
