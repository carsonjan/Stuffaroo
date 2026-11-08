"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Children, type ReactNode, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Altitude's section pattern: title left, round arrows and a "Shop all" pill right,
 * then a horizontal row. Shows 4.3 tiles on desktop, 2.6 on tablet, 1.6 on mobile
 * so the peek signals scroll.
 */
export function Rail({
  title,
  eyebrow,
  allHref,
  allLabel = "Shop all",
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  allHref: string;
  allLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className={cn("container", className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="t-label mb-3 text-ink-2">{eyebrow}</p>}
          <h2 className="t-h2">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={`Scroll ${title} back`}
            className="press hidden size-10 items-center justify-center rounded-full bg-surface text-ink transition-colors duration-200 hover:bg-surface-2 md:flex"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={`Scroll ${title} forward`}
            className="press hidden size-10 items-center justify-center rounded-full bg-surface text-ink transition-colors duration-200 hover:bg-surface-2 md:flex"
          >
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
          <Link
            href={allHref}
            className="t-label flex h-10 items-center rounded-pill border border-ink/20 px-4 transition-colors duration-200 hover:border-ink"
          >
            {allLabel}
          </Link>
        </div>
      </div>
      <ul
        ref={track}
        className="no-scrollbar -mx-[var(--gutter)] mt-6 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-3.5 overflow-x-auto px-[var(--gutter)] pb-2 md:mt-8 md:gap-4"
      >
        {Children.map(children, (child) => (
          <li className="w-[calc((100%-14px)/1.6)] shrink-0 snap-start md:w-[calc((100%-32px)/2.6)] xl:w-[calc((100%-64px)/4.3)]">
            {child}
          </li>
        ))}
      </ul>
    </section>
  );
}
