"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

import { type Mode, modes } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type Box = { left: number; width: number };

/**
 * Buy · Rent · Request: one frosted segmented pill with counts. Each segment is a
 * link that sets ?mode=, so it works without JavaScript and the URL is shareable.
 * The active segment is the one place Roo orange marks state.
 *
 * With JavaScript, one orange indicator slides between segments. It moves on click
 * (before the server round trip lands) and re-aims mid-flight on a second click.
 * Segments differ in width, so the indicator is measured rather than a fixed step.
 */
export function ModeToggle({
  active,
  counts,
  hrefs,
  className,
}: {
  /** null when every mode is shown (Browse with no ?mode=) */
  active: Mode | null;
  counts: Record<Mode, number>;
  /** Where each segment links; precomputed because a server page can't pass a function */
  hrefs: Record<Mode, string>;
  className?: string;
}) {
  // Optimistic selection: follows the click right away, then the URL once it settles
  const [selected, setSelected] = useState<Mode | null>(active);
  const [synced, setSynced] = useState(active);
  if (active !== synced) {
    setSynced(active);
    setSelected(active);
  }

  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(new Map<Mode, HTMLAnchorElement>());
  const [box, setBox] = useState<Box | null>(null);
  // The first placement snaps; only later moves animate
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const el = selected ? linkRefs.current.get(selected) : undefined;
      setBox((prev) =>
        el
          ? { left: el.offsetLeft, width: el.offsetWidth }
          : prev && { ...prev, width: 0 },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [selected]);

  useLayoutEffect(() => {
    if (box && !animate) {
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [box, animate]);

  const measured = box !== null;

  return (
    <nav
      ref={navRef}
      aria-label="Mode"
      className={cn("frost relative inline-flex rounded-pill p-1", className)}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1 bottom-1 left-0 rounded-pill bg-roo",
          animate &&
            "transition-[transform,width,opacity] duration-[420ms] ease-[var(--ease-out)]",
        )}
        style={{
          transform: `translateX(${box?.left ?? 0}px)`,
          width: box?.width ?? 0,
          opacity: box && box.width > 0 ? 1 : 0,
        }}
      />
      {modes.map(({ key, label }) => {
        const isSelected = key === selected;
        return (
          <Link
            key={key}
            ref={(el) => {
              if (el) linkRefs.current.set(key, el);
              else linkRefs.current.delete(key);
            }}
            href={hrefs[key]}
            scroll={false}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              // Re-clicking the active mode is page-specific (Browse turns it off), so the URL decides
              if (key !== active) setSelected(key);
            }}
            aria-current={key === active ? "true" : undefined}
            className={cn(
              "press t-label relative z-[1] flex h-10 items-center gap-1.5 rounded-pill px-4 text-ink transition-colors duration-200 ease-out md:px-5",
              // Before the indicator is measured (and without JS) the segment paints itself
              isSelected && !measured && "bg-roo",
              !isSelected && "hover:bg-white/60",
            )}
          >
            {label}
            <span
              className={cn(
                "num font-normal transition-colors duration-200",
                isSelected ? "text-ink" : "text-ink-2",
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
