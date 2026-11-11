"use client";

import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The search pill: white with a soft float shadow, an orange round submit.
 * Submits ?q= to the marketplace; Enter submits.
 */
export function PromptBox({
  id,
  placeholder,
  className,
}: {
  id: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <form
      action={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/marketplace/browse`}
      className={cn(
        "flex h-16 w-full items-center gap-2 rounded-pill border border-rule-field bg-paper-2 pr-2 pl-6 shadow-float text-left focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-focus",
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        Search items
      </label>
      <input
        id={id}
        name="q"
        placeholder={placeholder}
        className="h-[52px] min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-signal bg-[image:var(--cta-gradient)] text-ink transition-colors duration-[120ms] hover:bg-signal-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:translate-y-px"
      >
        <ArrowUp className="size-5" aria-hidden />
      </button>
    </form>
  );
}
