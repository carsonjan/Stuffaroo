"use client";

import {
  ChevronDown,
  Coins,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CURRENT_USER_ID, getProfile } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";

const navItems = [
  { href: "/marketplace/browse", label: "Browse" },
  { href: "/marketplace/deals", label: "Deals" },
  { href: "/marketplace/wanted", label: "Wanted" },
  { href: "/marketplace/move-out", label: "Move-out" },
];

/** The team's Post menu: three ways to put something on Stuffaroo. */
const postOptions = [
  {
    href: "/marketplace/listings/new",
    label: "Sell an item",
    hint: "Set a price and pickup date",
    icon: ShoppingBag,
  },
  {
    href: "/marketplace/listings/new",
    label: "Rent something out",
    hint: "Per day or per term, with a deposit",
    icon: HandCoins,
  },
  {
    href: "/marketplace/wanted/new",
    label: "Post a request",
    hint: "Tell classmates what you need",
    icon: Megaphone,
  },
];

/** Reads the current path; render inside <Suspense> with <SiteHeader activePath={null} /> as fallback. */
export function SiteHeaderWithPath() {
  return <SiteHeader activePath={usePathname()} />;
}

export function SiteHeader({ activePath }: { activePath: string | null }) {
  const me = getProfile(CURRENT_USER_ID);
  const isActive = (href: string) =>
    activePath !== null &&
    (activePath === href || activePath.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-[300] h-[104px] px-3 pt-4 sm:px-4">
      <div className="site-nav-pill mx-auto flex h-20 max-w-[1170px] items-center gap-6 rounded-pill bg-paper-2 py-4 pr-4 pl-8 shadow-float">
        <Link
          href="/marketplace"
          className="shrink-0 rounded-small text-ink"
          aria-label="Stuffaroo home"
        >
          <Logo hop className="text-[1.75rem]" />
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-6 md:flex"
          aria-label="Main"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-small text-base font-medium text-ink underline-offset-[6px] hover:underline",
                isActive(item.href) && "underline decoration-1",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button size="lg" className="hidden sm:inline-flex" />}
            >
              Post <ChevronDown data-icon="inline-end" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
              {postOptions.map(({ href, label, hint, icon: Icon }) => (
                <DropdownMenuItem
                  key={label}
                  render={<Link href={href} />}
                  className="items-start gap-3 rounded-[14px] px-3 py-2.5"
                >
                  <Icon className="mt-0.5 size-4 shrink-0" />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-ink">
                      {label}
                    </span>
                    <span className="text-xs text-ink-3">{hint}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {me && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="size-12 hover:bg-paper-3"
                    aria-label="Account menu"
                  />
                }
              >
                <Avatar>
                  <AvatarFallback className="bg-tint-blue text-xs font-medium text-ink">
                    {me.initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="font-medium text-foreground">
                      {me.displayName}
                    </div>
                    <div className="text-xs font-normal">{me.campus}</div>
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
                <DropdownMenuItem
                  render={<Link href={`/marketplace/profile/${me.id}`} />}
                >
                  <User /> Public profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <LogOut /> Sign out (not in mockup)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="size-12 hover:bg-paper-3 md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-small px-3 py-2.5 text-base text-ink-3 hover:text-ink-2",
                      isActive(item.href) &&
                        "bg-paper-3 font-medium text-ink-2",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <p className="mt-5 px-3 text-sm text-ink-3">Post</p>
                {postOptions.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 rounded-small px-3 py-2.5 text-base text-ink-2 hover:bg-paper-3"
                  >
                    <Icon className="size-4" aria-hidden /> {label}
                  </Link>
                ))}
                <Link
                  href="/marketplace/dashboard"
                  className="mt-4 rounded-small px-3 py-2.5 text-base text-ink-3 hover:text-ink-2"
                >
                  Dashboard
                </Link>
                <Link
                  href="/marketplace/deposits"
                  className="rounded-small px-3 py-2.5 text-base text-ink-3 hover:text-ink-2"
                >
                  Deposits
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
