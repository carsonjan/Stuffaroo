import { cn } from "@/lib/utils";

/**
 * Roo, Stuffaroo's kangaroo mascot, from the team's index.html mockup.
 * Carries a desk lamp and a book in its pouch. Hops, wiggles its ears and blinks;
 * every animation stops under prefers-reduced-motion (base.css).
 */
export function Roo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("roo-hop", className)}
      viewBox="0 0 200 240"
      role="img"
      aria-label="Roo, a cartoon kangaroo carrying a desk lamp and a book in its pouch"
    >
      <g
        className="stroke-roo-line"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* tail */}
        <path
          d="M140 200 C 180 205, 196 180, 190 150"
          fill="none"
          strokeWidth={14}
        />
        <path
          d="M140 200 C 180 205, 196 180, 190 150"
          fill="none"
          className="stroke-roo-fur"
          strokeWidth={7}
        />
        {/* ears */}
        <g className="roo-ear-l">
          <ellipse
            cx="72"
            cy="36"
            rx="13"
            ry="28"
            className="fill-roo-fur"
            transform="rotate(-14 72 36)"
          />
          <ellipse
            cx="72"
            cy="40"
            rx="6"
            ry="17"
            className="fill-roo-ear"
            stroke="none"
            transform="rotate(-14 72 40)"
          />
        </g>
        <g className="roo-ear-r">
          <ellipse
            cx="128"
            cy="36"
            rx="13"
            ry="28"
            className="fill-roo-fur"
            transform="rotate(14 128 36)"
          />
          <ellipse
            cx="128"
            cy="40"
            rx="6"
            ry="17"
            className="fill-roo-ear"
            stroke="none"
            transform="rotate(14 128 40)"
          />
        </g>
        {/* feet */}
        <ellipse cx="74" cy="222" rx="26" ry="11" className="fill-roo-fur" />
        <ellipse cx="126" cy="222" rx="26" ry="11" className="fill-roo-fur" />
        {/* body */}
        <ellipse cx="100" cy="160" rx="54" ry="62" className="fill-roo-fur" />
        <ellipse
          cx="100"
          cy="170"
          rx="38"
          ry="44"
          className="fill-roo-belly"
          stroke="none"
        />
        {/* items peeking from the pouch */}
        <rect
          x="104"
          y="146"
          width="22"
          height="30"
          rx="3"
          className="fill-roo-book"
          transform="rotate(12 115 161)"
        />
        <path
          d="M110 154 L 120 156"
          fill="none"
          strokeWidth={3}
          transform="rotate(12 115 161)"
        />
        <path
          d="M74 150 L 94 150 L 98 136 L 70 136 Z"
          className="fill-roo-lamp"
        />
        <path d="M84 150 L 84 170" fill="none" />
        {/* pouch */}
        <path
          d="M64 168 Q 100 158 136 168 Q 134 206 100 208 Q 66 206 64 168 Z"
          className="fill-roo-pouch"
        />
        <path
          d="M76 176 Q 100 170 124 176"
          fill="none"
          strokeWidth={3}
          opacity={0.5}
        />
        {/* arms holding the pouch rim */}
        <ellipse
          cx="62"
          cy="160"
          rx="10"
          ry="16"
          className="fill-roo-fur"
          transform="rotate(30 62 160)"
        />
        <ellipse
          cx="138"
          cy="160"
          rx="10"
          ry="16"
          className="fill-roo-fur"
          transform="rotate(-30 138 160)"
        />
        {/* head */}
        <ellipse cx="100" cy="84" rx="44" ry="40" className="fill-roo-fur" />
        <ellipse
          cx="100"
          cy="100"
          rx="24"
          ry="17"
          className="fill-roo-belly"
          stroke="none"
        />
      </g>
      {/* face */}
      <g>
        <g className="roo-eye">
          <ellipse cx="83" cy="80" rx="6.5" ry="8" className="fill-roo-line" />
          <circle cx="85" cy="77" r="2.4" className="fill-paper-2" />
        </g>
        <g className="roo-eye">
          <ellipse cx="117" cy="80" rx="6.5" ry="8" className="fill-roo-line" />
          <circle cx="119" cy="77" r="2.4" className="fill-paper-2" />
        </g>
        <ellipse
          cx="70"
          cy="96"
          rx="8"
          ry="5"
          className="fill-roo-cheek"
          opacity={0.75}
        />
        <ellipse
          cx="130"
          cy="96"
          rx="8"
          ry="5"
          className="fill-roo-cheek"
          opacity={0.75}
        />
        <ellipse cx="100" cy="94" rx="6" ry="4.2" className="fill-roo-line" />
        <path
          d="M92 102 Q 96 107 100 102 Q 104 107 108 102"
          fill="none"
          className="stroke-roo-line"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
