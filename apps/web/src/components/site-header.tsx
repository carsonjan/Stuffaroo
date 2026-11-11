"use client";

import {
  Coins,
  Heart,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Search,
  ShoppingBag,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navCategories } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { Viewer } from "@/lib/viewer";

import { Logo } from "./logo";

/** Three ways to put something on Stuffaroo, in the Post menu. */
const postOptions = [
  {
    href: "/marketplace/listings/new",
    label: "Sell an item",
    hint: "Set a price and a pickup spot",
    icon: Tag,
  },
  {
    href: "/marketplace/listings/new",
    label: "Rent something out",
    hint: "A daily rate plus a deposit",
    icon: ShoppingBag,
  },
  {
    href: "/marketplace/wanted/new",
    label: "Post a request",
    hint: "Tell classmates what you need",
    icon: Megaphone,
  },
];

/** Reads the current path; render inside <Suspense> with <SiteHeader activePath={null} viewer={null} /> as fallback. */
export function SiteHeaderWithPath({ viewer }: { viewer: Viewer }) {
  const params = useSearchParams();
  const query = params.toString();
  return (
    <SiteHeader
      activePath={`${usePathname()}${query ? `?${query}` : ""}`}
      viewer={viewer}
    />
  );
}

/**
 * Depop's header: logo left, search as the dominant element, actions right, then a
 * quiet text row of categories. `viewer` is null while the session is loading.
 */
export function SiteHeader({
  activePath,
  viewer,
}: {
  activePath: string | null;
  viewer: Viewer | null;
}) {
  const loginHref = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/auth/login?returnTo=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${activePath ?? "/marketplace"}`)}`;

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-line bg-bg/95 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-4 md:h-[72px] md:gap-8">
        <Link
          href="/marketplace"
          className="shrink-0 rounded-badge"
          aria-label="Stuffaroo home"
        >
          <Logo />
        </Link>

        <form
          action={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/marketplace/browse`}
          className="hidden h-11 max-w-[640px] flex-1 items-center gap-2.5 rounded-pill bg-surface px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink md:mx-auto md:flex"
        >
          <Search className="size-4 shrink-0 text-ink-2" aria-hidden />
          <label htmlFor="header-search" className="visually-hidden">
            Search Stuffaroo
          </label>
          <input
            id="header-search"
            name="q"
            placeholder="Search items, course codes or classmates"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-3"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          {viewer?.status === "signed-out" && (
            // Plain <a>: /auth/login is an Auth0 route handler, not a page.
            <a
              href={loginHref}
              className={cn(buttonVariants({ variant: "ghost" }), "px-3")}
            >
              Sign in
            </a>
          )}
          {viewer?.status === "unconfigured" && (
            <span className="t-meta hidden text-ink-3 lg:inline">
              Sign-in off in this demo
            </span>
          )}

          <Link
            href="/marketplace/dashboard"
            aria-label="Saved items"
            className="hidden size-10 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-surface md:flex"
          >
            <Heart className="size-[18px]" strokeWidth={1.5} aria-hidden />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="brand" className="hidden md:inline-flex" />
              }
            >
              Post an item
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 p-2 z-[var(--z-toast)]"
            >
              {postOptions.map(({ href, label, hint, icon: Icon }) => (
                <DropdownMenuItem
                  key={label}
                  render={<Link href={href} />}
                  className="items-start gap-3 rounded-img px-3 py-2.5"
                >
                  <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                  <span className="flex flex-col gap-1">
                    <span className="t-label text-ink">{label}</span>
                    <span className="text-[0.8125rem] font-light text-ink-2">
                      {hint}
                    </span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {viewer?.status === "signed-in" && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="ml-1"
                    aria-label="Account menu"
                  />
                }
              >
                <Avatar>
                  <AvatarFallback className="bg-surface-2 text-[0.6875rem] font-medium text-ink">
                    {viewer.initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="font-medium text-ink">{viewer.name}</div>
                    {viewer.profile?.campus && (
                      <div className="text-xs font-normal text-ink-2">
                        {viewer.profile.campus}
                      </div>
                    )}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href="/marketplace/dashboard" />}
                >
                  <LayoutDashboard /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/marketplace/deposits" />}
                >
                  <Coins /> Deposits
                </DropdownMenuItem>
                {viewer.profile && (
                  <DropdownMenuItem
                    render={
                      <Link
                        href={`/marketplace/profile/${viewer.profile.id}`}
                      />
                    }
                  >
                    <User /> Public profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <a
                      href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/auth/logout`}
                    />
                  }
                >
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile: search gets its own full-width row */}
      <form
        action={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/marketplace/browse`}
        className="container pb-3 md:hidden"
      >
        <div className="flex h-11 items-center gap-2.5 rounded-pill bg-surface px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
          <Search className="size-4 shrink-0 text-ink-2" aria-hidden />
          <label htmlFor="header-search-mobile" className="visually-hidden">
            Search Stuffaroo
          </label>
          <input
            id="header-search-mobile"
            name="q"
            placeholder="Search items or course codes"
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-3"
          />
        </div>
      </form>

      <nav aria-label="Categories" className="container">
        <ul className="no-scrollbar -mx-[var(--gutter)] flex gap-6 overflow-x-auto px-[var(--gutter)] md:justify-center md:gap-8">
          {navCategories.map((c) => {
            const active = activePath?.endsWith(
              c.href.split("/marketplace")[1],
            );
            return (
              <li key={c.label} className="shrink-0">
                <Link
                  href={c.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "t-label flex h-10 items-center border-b border-transparent text-ink-2 transition-colors duration-200 hover:text-ink",
                    active && "border-ink text-ink",
                  )}
                >
                  {c.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
