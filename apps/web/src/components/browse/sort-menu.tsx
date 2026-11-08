"use client";

import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Sort, sorts } from "@/lib/browse";

/** The sort pill: Newest, Price, Nearest. Each option is a link, so the sort lives in the URL. */
export function SortMenu({
  active,
  hrefs,
  nearestLabel,
}: {
  active: Sort;
  hrefs: Record<Sort, string>;
  nearestLabel: string;
}) {
  const label = (key: Sort) =>
    key === "nearest"
      ? nearestLabel
      : (sorts.find((s) => s.key === key)?.label ?? key);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="t-label press flex h-10 items-center gap-1.5 rounded-pill bg-surface px-4 text-ink transition-colors duration-200 hover:bg-surface-2">
        <span className="text-ink-2">Sort</span> {label(active).split(",")[0]}
        <ChevronDown className="size-3.5" strokeWidth={1.75} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5">
        {sorts.map((s) => (
          <DropdownMenuItem
            key={s.key}
            render={<Link href={hrefs[s.key]} scroll={false} />}
            className="justify-between rounded-img px-3 py-2.5 text-[0.875rem] font-light"
          >
            {label(s.key)}
            {s.key === active && (
              <Check className="size-4" strokeWidth={1.75} aria-hidden />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
