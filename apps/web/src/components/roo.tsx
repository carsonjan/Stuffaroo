"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Roo peeking over an edge: head, ears and two paws gripping the top of
 * whatever it sits on (the hero search). Place it with its bottom 10% overlapping
 * that edge, e.g. `absolute bottom-[calc(100%-10px)]` on a `relative` parent.
 * Rises on load, blinks, twitches an ear and follows the cursor with its eyes.
 * Lifts a little when a parent with `group/peek` holds focus. Decorative.
 */
export function Roo({ className }: { className?: string }) {
  const eyes = useRef<SVGGElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = eyes.current;
        if (!el) return;
        const box = el.ownerSVGElement?.getBoundingClientRect();
        if (!box) return;
        const dx = e.clientX - (box.left + box.width / 2);
        const dy = e.clientY - (box.top + box.height * 0.7);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 300);
        el.setAttribute(
          "transform",
          `translate(${((dx / d) * 2.2 * k).toFixed(2)} ${((dy / d) * 1.8 * k).toFixed(2)})`,
        );
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <svg
      viewBox="0 0 120 80"
      className={cn("pointer-events-none overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <radialGradient id="roo-fur" cx="0.42" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ffb07a" />
          <stop offset="0.55" stopColor="#f58a44" />
          <stop offset="1" stopColor="#e2692a" />
        </radialGradient>
        <linearGradient id="roo-ear-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb3bd" />
          <stop offset="1" stopColor="#ff8fa0" />
        </linearGradient>
        <radialGradient id="roo-paw" cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffb07a" />
          <stop offset="1" stopColor="#ea7434" />
        </radialGradient>
        <clipPath id="roo-above-edge">
          <rect x="-20" y="-20" width="160" height="90" />
        </clipPath>
      </defs>

      {/* everything above the edge rises from behind it */}
      <g clipPath="url(#roo-above-edge)">
        <g className="roo-lift">
          <g className="roo-rise">
            {/* ears: tall and pointed, tilted out */}
            <g className="roo-ear-l">
              <path
                d="M47 44 C 37 32, 34 12, 39 3 C 47 9, 53 27, 54 42 Z"
                fill="url(#roo-fur)"
              />
              <path
                d="M47.5 40 C 41 30, 39.5 17, 41.5 10 C 46.5 16, 50 28, 50.5 39 Z"
                fill="url(#roo-ear-in)"
              />
            </g>
            <g className="roo-ear-r">
              <path
                d="M73 44 C 83 32, 86 12, 81 3 C 73 9, 67 27, 66 42 Z"
                fill="url(#roo-fur)"
              />
              <path
                d="M72.5 40 C 79 30, 80.5 17, 78.5 10 C 73.5 16, 70 28, 69.5 39 Z"
                fill="url(#roo-ear-in)"
              />
            </g>

            {/* head */}
            <ellipse cx="60" cy="70" rx="33" ry="29" fill="url(#roo-fur)" />
            {/* soft forehead highlight */}
            <ellipse
              cx="54"
              cy="52"
              rx="12"
              ry="6"
              fill="#fff"
              opacity="0.18"
            />

            {/* cheeks */}
            <ellipse
              cx="38"
              cy="69"
              rx="5.5"
              ry="3.2"
              fill="#ff7f8f"
              opacity="0.45"
            />
            <ellipse
              cx="82"
              cy="69"
              rx="5.5"
              ry="3.2"
              fill="#ff7f8f"
              opacity="0.45"
            />

            {/* eyes follow the cursor; the inner group blinks */}
            <g ref={eyes}>
              {[47, 73].map((x) => (
                <g
                  key={x}
                  className="roo-blink"
                  style={{ transformOrigin: `${x}px 60px` }}
                >
                  <ellipse cx={x} cy="60" rx="4.4" ry="5.4" fill="#2a1712" />
                  <circle cx={x + 1.5} cy="57.8" r="1.6" fill="#fff" />
                  <circle
                    cx={x - 1.3}
                    cy="62.2"
                    r="0.7"
                    fill="#fff"
                    opacity="0.7"
                  />
                </g>
              ))}
            </g>
            {/* brows */}
            <path
              d="M42.5 51.5 Q 46.5 49.2 50.5 50.8"
              fill="none"
              stroke="#b9541c"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M69.5 50.8 Q 73.5 49.2 77.5 51.5"
              fill="none"
              stroke="#b9541c"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* muzzle and nose, cut off by the edge */}
            <ellipse cx="60" cy="77" rx="15" ry="9.5" fill="#ffdcbc" />
            <ellipse cx="60" cy="69.4" rx="4.4" ry="2.9" fill="#3a1f17" />
            <ellipse
              cx="58.9"
              cy="68.5"
              rx="1.4"
              ry="0.8"
              fill="#fff"
              opacity="0.6"
            />
          </g>
        </g>
      </g>

      {/* paws gripping the edge, in front of it */}
      <g className="roo-paws">
        {[37, 83].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="71" rx="7.5" ry="5.2" fill="url(#roo-paw)" />
            <path
              d={`M${x - 2.4} 73.1 v-2.6 M${x + 2.4} 73.1 v-2.6`}
              stroke="#c25a20"
              strokeWidth="0.9"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
