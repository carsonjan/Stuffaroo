import Link from "next/link";

import { type Mode, modes } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * Buy · Rent · Request: one frosted segmented pill with counts. Each segment is a
 * link that sets ?mode=, so it works without JavaScript and the URL is shareable.
 * The active segment is the one place Roo orange marks state.
 */
export function ModeToggle({
  active,
  counts,
  hrefFor,
  className,
}: {
  /** null when every mode is shown (Browse with no ?mode=) */
  active: Mode | null;
  counts: Record<Mode, number>;
  hrefFor: (mode: Mode) => string;
  className?: string;
}) {
  return (
    <nav
      aria-label="Mode"
      className={cn("frost inline-flex rounded-pill p-1", className)}
    >
      {modes.map(({ key, label }) => {
        const selected = key === active;
        return (
          <Link
            key={key}
            href={hrefFor(key)}
            scroll={false}
            aria-current={selected ? "true" : undefined}
            className={cn(
              "t-label flex h-10 items-center gap-1.5 rounded-pill px-4 transition-colors duration-200 ease-out md:px-5",
              selected ? "bg-roo text-ink" : "text-ink hover:bg-white/60",
            )}
          >
            {label}
            <span
              className={cn(
                "num font-normal",
                selected ? "text-ink" : "text-ink-2",
              )}
            >
              {counts[key]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
