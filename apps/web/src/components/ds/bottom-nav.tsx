"use client";

import { Heart, Home, Plus, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/marketplace", label: "Home", icon: Home },
  { href: "/marketplace/browse", label: "Browse", icon: Search },
  {
    href: "/marketplace/listings/new",
    label: "Post",
    icon: Plus,
    primary: true,
  },
  { href: "/marketplace/dashboard", label: "Saved", icon: Heart },
  { href: "/marketplace/dashboard", label: "Profile", icon: User },
];

/** DOVV's floating frosted dark pill, fixed at the bottom on mobile only. */
export function BottomNavWithPath() {
  return <BottomNav path={usePathname()} />;
}

/** `path` is null in the prerendered fallback, before the URL is known. */
export function BottomNav({ path }: { path: string | null }) {
  return (
    <nav
      aria-label="Quick"
      className="frost-dark fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-1/2 z-[var(--z-nav)] flex -translate-x-1/2 items-center gap-1 rounded-pill p-1.5 shadow-float md:hidden"
    >
      {items.map(({ href, label, icon: Icon, primary }) => {
        const active =
          !primary &&
          (href === "/marketplace" ? path === href : path?.startsWith(href)) &&
          label !== "Profile";
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-pill text-[0.6875rem] leading-none font-medium tracking-[0.04em] uppercase transition-colors duration-200",
              primary
                ? "mx-1 size-12 bg-roo text-ink"
                : "h-12 w-14 text-white/70 hover:text-white",
              active && "bg-white/15 text-white",
            )}
          >
            <Icon
              className={primary ? "size-5" : "size-[18px]"}
              strokeWidth={1.75}
              aria-hidden
            />
            {primary ? <span className="visually-hidden">{label}</span> : label}
          </Link>
        );
      })}
    </nav>
  );
}
