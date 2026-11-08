import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Fill = "peach" | "lime" | "holo" | "roo";

const fills: Record<Fill, string> = {
  peach: "var(--grad-peach)",
  lime: "var(--grad-lime)",
  holo: "var(--grad-holo)",
  roo: "var(--color-roo)",
};

/**
 * A die-cut sticker (DOVV): thick white outline, soft drop shadow, gradient fill,
 * `label-lg` text. Tilt between -8° and +12°. Max 3 per screen, and only on the
 * Home hero, empty states, the move-out tile and success screens.
 * Position it with `className` (it is absolutely positioned by the caller, or inline).
 */
export function Sticker({
  variant = "pill",
  fill = "peach",
  rotate = 0,
  className,
  children,
  label,
}: {
  variant?: "pill" | "burst" | "circle";
  fill?: Fill;
  rotate?: number;
  className?: string;
  children: ReactNode;
  /** Accessible text when `children` is decorative (a face, Roo). */
  label?: string;
}) {
  const style = {
    "--sticker-rotate": `${rotate}deg`,
    filter:
      "drop-shadow(0 10px 14px rgb(14 12 13 / 0.22)) drop-shadow(0 2px 2px rgb(14 12 13 / 0.12))",
  } as CSSProperties;

  if (variant === "burst") {
    return (
      <span
        className={cn(
          "sticker relative inline-grid size-[120px] place-items-center",
          className,
        )}
        style={style}
        {...a11y(label)}
      >
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 size-full"
          aria-hidden
        >
          <defs>
            <linearGradient id={`burst-${fill}`} x1="0" y1="0" x2="1" y2="1">
              {fill === "lime" && (
                <>
                  <stop offset="0" stopColor="var(--color-lime-a)" />
                  <stop offset="1" stopColor="var(--color-lime-b)" />
                </>
              )}
              {fill === "peach" && (
                <>
                  <stop offset="0" stopColor="var(--color-peach-a)" />
                  <stop offset="1" stopColor="var(--color-peach-b)" />
                </>
              )}
              {fill === "holo" && (
                <>
                  <stop offset="0" stopColor="var(--color-holo-a)" />
                  <stop offset="0.5" stopColor="var(--color-holo-b)" />
                  <stop offset="1" stopColor="var(--color-holo-c)" />
                </>
              )}
              {fill === "roo" && (
                <>
                  <stop offset="0" stopColor="var(--color-roo)" />
                  <stop offset="1" stopColor="var(--color-roo)" />
                </>
              )}
            </linearGradient>
          </defs>
          <path
            d={burstPath(60, 60, 56, 46, 14)}
            fill={`url(#burst-${fill})`}
            stroke="var(--color-white)"
            strokeWidth={6}
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="relative max-w-[78px] text-center text-[0.8125rem] leading-[1.05] font-medium tracking-[0.03em] text-ink uppercase"
          aria-hidden={label ? true : undefined}
        >
          {children}
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "sticker inline-flex items-center justify-center border-[5px] border-white text-ink",
        variant === "pill" &&
          "rounded-pill px-5 py-2.5 text-[0.8125rem] leading-none font-medium tracking-[0.03em] whitespace-nowrap uppercase md:text-[0.875rem]",
        variant === "circle" && "size-[104px] overflow-hidden rounded-full",
        className,
      )}
      style={{ ...style, background: fills[fill] }}
      {...a11y(label)}
    >
      {children}
    </span>
  );
}

/** A starburst outline: `points` spikes alternating between outer and inner radius. */
function burstPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points: number,
) {
  const step = Math.PI / points;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    d += `${i === 0 ? "M" : "L"}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)} `;
  }
  return `${d}Z`;
}

/** A sticker with a label reads as one image; without one, its text is read as-is. */
function a11y(label: string | undefined) {
  return label ? ({ role: "img", "aria-label": label } as const) : {};
}
