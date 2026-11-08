import { cn } from "@/lib/utils";

/**
 * The wordmark: "Stuff" in ink, "aroo" in orange, both in Fredoka 700.
 * With `hop`, "aroo" hops when the mark is hovered. Read as one label: "Stuffaroo".
 */
export function Logo({
  className,
  hop = false,
}: {
  className?: string;
  hop?: boolean;
}) {
  return (
    <span
      className={cn(
        "group/logo inline-flex items-baseline text-2xl leading-none",
        className,
      )}
      aria-label="Stuffaroo"
      role="img"
    >
      <span className="wordmark text-ink" aria-hidden>
        Stuff
      </span>
      <span
        className={cn(
          "wordmark inline-block text-signal-deep",
          hop && "group-hover/logo:animate-[hop_560ms_var(--ease-out)]",
        )}
        aria-hidden
      >
        aroo
      </span>
    </span>
  );
}
