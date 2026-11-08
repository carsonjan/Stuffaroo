"use client";

import { HandCoins, Megaphone, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { WantedCard } from "@/components/wanted/wanted-card";
import { wantedPosts } from "@/lib/mock-data";
import { buyListings, rentListings } from "@/lib/mock-shop";
import { cn } from "@/lib/utils";

import { BuyCard, RentCard } from "./shop-cards";

const modes = [
  {
    key: "buy",
    label: "Buy",
    hint: "Own it",
    icon: ShoppingBag,
    title: "Fresh on campus",
  },
  {
    key: "rent",
    label: "Rent",
    hint: "Borrow it",
    icon: HandCoins,
    title: "Rent for the term",
  },
  {
    key: "request",
    label: "Request",
    hint: "Ask for it",
    icon: Megaphone,
    title: "Classmates need these",
  },
] as const;

type Mode = (typeof modes)[number]["key"];

/** The team's Buy / Rent / Request switcher, driving one grid. Buy shows without JavaScript. */
export function ModeSwitcher() {
  const [mode, setMode] = useState<Mode>("buy");
  const active = modes.find((m) => m.key === mode) ?? modes[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="What are you after?"
        className="relative grid grid-cols-3 rounded-pill bg-paper-2 p-1.5 shadow-card sm:max-w-[560px]"
      >
        {/* One indicator slides between tabs on a critically damped spring; a new click re-aims it mid-flight */}
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-12px)/3)] rounded-pill bg-signal bg-[image:var(--cta-gradient)] transition-transform duration-[var(--dur-spring)] ease-[var(--spring)]"
          style={{
            transform: `translateX(${modes.findIndex((m) => m.key === mode) * 100}%)`,
          }}
        />
        {modes.map(({ key, label, hint, icon: Icon }) => {
          const selected = key === mode;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`mode-${key}`}
              aria-selected={selected}
              aria-controls="mode-panel"
              onClick={() => setMode(key)}
              className={cn(
                "press relative z-[1] flex h-14 items-center justify-center gap-2 rounded-pill px-3 text-left transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                selected ? "text-ink" : "text-ink-3 hover:text-ink",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs opacity-80 max-sm:hidden">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        key={mode}
        id="mode-panel"
        role="tabpanel"
        aria-labelledby={`mode-${mode}`}
        className="settle-in mt-10"
      >
        <h2 className="text-[2.25rem] leading-[1.05] text-ink sm:text-[3.25rem]">
          {active.title}
        </h2>
        {mode !== "request" && (
          <div className="mt-8 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
            {mode === "buy" &&
              buyListings.map((item) => <BuyCard key={item.id} item={item} />)}
            {mode === "rent" &&
              rentListings.map((item) => (
                <RentCard key={item.id} item={item} />
              ))}
          </div>
        )}
        {mode === "request" && (
          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))]">
            {wantedPosts
              .filter((post) => post.status === "open")
              .slice(0, 3)
              .map((post) => (
                <WantedCard key={post.id} post={post} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
