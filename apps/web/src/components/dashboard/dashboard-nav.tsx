"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/requests", label: "Requests" },
  { href: "/deposits", label: "Deposits" },
];

export function DashboardNavWithPath() {
  return <DashboardNav activePath={usePathname()} />;
}

export function DashboardNav({ activePath }: { activePath: string | null }) {
  return (
    <nav className="flex gap-1 border-b" aria-label="Dashboard">
      {tabs.map((tab) => {
        const active = activePath === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm transition-colors",
              active
                ? "border-ink-2 font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
