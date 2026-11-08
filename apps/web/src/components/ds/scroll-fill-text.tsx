"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * A statement whose words fill from faint to full colour, word by word, as the
 * block scrolls through the viewport (Emblematica). Fully filled under
 * prefers-reduced-motion and before hydration.
 */
export function ScrollFillText({
  text,
  tone = "light",
  className,
}: {
  text: string;
  /** "dark" for white text on an ink band. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");
  // -1 = not measured yet: render fully filled (no-JS and reduced motion look the same)
  const [filled, setFilled] = useState(-1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Starts filling when the top reaches 85% of the viewport, done when the bottom reaches 45%
      const start = vh * 0.85;
      const end = vh * 0.45;
      const progress = (start - rect.top) / (start - end + rect.height);
      const clamped = Math.min(1, Math.max(0, progress));
      setFilled(Math.round(clamped * words.length));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    let listening = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !listening) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        listening = true;
        onScroll();
      } else if (!entry.isIntersecting && listening) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        listening = false;
        measure();
      }
    });
    observer.observe(el);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [words.length]);

  const on = tone === "dark" ? "text-white" : "text-ink";
  const off = tone === "dark" ? "text-white/25" : "text-ink-4";

  return (
    <p ref={ref} className={cn("t-statement", className)}>
      {words.map((word, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: words are positional and the text is static
          key={i}
          className={cn(
            "transition-colors duration-200 ease-out",
            filled === -1 || i < filled ? on : off,
          )}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
