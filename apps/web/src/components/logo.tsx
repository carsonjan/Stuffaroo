import { cn } from "@/lib/utils";

/**
 * The wordmark: "Stuffaroo" in Gluten 900, sentence case. Size it with a text-* class.
 * "aroo" hops when the mark is hovered (still under prefers-reduced-motion).
 * Read as one word: the halves are aria-hidden behind the label.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Stuffaroo"
      className={cn(
        "group/logo font-wordmark inline-flex items-baseline text-[1.5rem] leading-none font-black tracking-[-0.06em] text-ink",
        className,
      )}
    >
      <span aria-hidden>Stuff</span>
      <span
        aria-hidden
        className="inline-block text-roo group-hover/logo:animate-[hop_560ms_var(--ease-out)]"
      >
        aroo
      </span>
    </span>
  );
}
