"use client";

import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Mobile filters: a frosted "Filters" pill that opens a bottom sheet with the
 * same panel as the desktop rail. It stays open while you tap several filters;
 * "Show results" closes it.
 */
export function FiltersSheet({
  count,
  results,
  children,
}: {
  count: number;
  results: number;
  children: ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger className="frost t-label press flex h-10 items-center gap-2 rounded-pill px-4 text-ink lg:hidden">
        <SlidersHorizontal className="size-4" strokeWidth={1.75} aria-hidden />
        Filters
        {count > 0 && (
          <span className="num flex size-5 items-center justify-center rounded-full bg-ink text-[0.6875rem] text-white">
            {count}
          </span>
        )}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] gap-0 rounded-t-tile border-0 bg-bg p-0"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <SheetTitle className="t-label text-ink">Filters</SheetTitle>
        </div>
        <div className="overflow-y-auto px-5 pb-4">{children}</div>
        <div className="border-t border-line p-4">
          <SheetClose className="t-label-lg h-12 w-full rounded-pill bg-ink text-white">
            Show {results} {results === 1 ? "result" : "results"}
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
