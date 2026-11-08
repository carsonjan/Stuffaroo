import { Sticker } from "./sticker";

/**
 * Roo as a static die-cut circle sticker: head and ears, with a lamp and a book
 * peeking out of the pouch. For empty states, success screens and the 404,
 * where the 3D Roo (Home hero only) must not load.
 */
export function RooStickerStatic({
  rotate = -6,
  size = 96,
  className,
}: {
  rotate?: number;
  size?: number;
  className?: string;
}) {
  return (
    <Sticker
      variant="circle"
      fill="holo"
      rotate={rotate}
      className={className}
      label="Roo, Stuffaroo's kangaroo"
    >
      <svg
        viewBox="28 10 144 144"
        style={{ width: size, height: size }}
        className="block"
        aria-hidden
      >
        <g
          stroke="var(--color-roo-line)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <ellipse
            cx="72"
            cy="40"
            rx="13"
            ry="28"
            fill="var(--color-roo-fur)"
            transform="rotate(-14 72 40)"
          />
          <ellipse
            cx="72"
            cy="44"
            rx="6"
            ry="17"
            fill="var(--color-roo-ear)"
            stroke="none"
            transform="rotate(-14 72 44)"
          />
          <ellipse
            cx="128"
            cy="40"
            rx="13"
            ry="28"
            fill="var(--color-roo-fur)"
            transform="rotate(14 128 40)"
          />
          <ellipse
            cx="128"
            cy="44"
            rx="6"
            ry="17"
            fill="var(--color-roo-ear)"
            stroke="none"
            transform="rotate(14 128 44)"
          />
          <ellipse
            cx="100"
            cy="172"
            rx="58"
            ry="62"
            fill="var(--color-roo-fur)"
          />
          <rect
            x="106"
            y="128"
            width="22"
            height="30"
            rx="3"
            fill="var(--color-roo-book)"
            transform="rotate(12 117 143)"
          />
          <path
            d="M74 140 L 94 140 L 98 126 L 70 126 Z"
            fill="var(--color-roo-lamp)"
          />
          <path d="M84 140 L 84 156" fill="none" />
          <path
            d="M60 150 Q 100 140 140 150 Q 138 190 100 192 Q 62 190 60 150 Z"
            fill="var(--color-roo-pouch)"
          />
          <ellipse
            cx="100"
            cy="86"
            rx="44"
            ry="40"
            fill="var(--color-roo-fur)"
          />
          <ellipse
            cx="100"
            cy="102"
            rx="24"
            ry="17"
            fill="var(--color-roo-belly)"
            stroke="none"
          />
        </g>
        <ellipse cx="83" cy="82" rx="6.5" ry="8" fill="var(--color-roo-line)" />
        <circle cx="85" cy="79" r="2.4" fill="var(--color-white)" />
        <ellipse
          cx="117"
          cy="82"
          rx="6.5"
          ry="8"
          fill="var(--color-roo-line)"
        />
        <circle cx="119" cy="79" r="2.4" fill="var(--color-white)" />
        <ellipse
          cx="70"
          cy="98"
          rx="8"
          ry="5"
          fill="var(--color-roo-cheek)"
          opacity={0.75}
        />
        <ellipse
          cx="130"
          cy="98"
          rx="8"
          ry="5"
          fill="var(--color-roo-cheek)"
          opacity={0.75}
        />
        <ellipse
          cx="100"
          cy="96"
          rx="6"
          ry="4.2"
          fill="var(--color-roo-line)"
        />
        <path
          d="M92 104 Q 96 109 100 104 Q 104 109 108 104"
          fill="none"
          stroke="var(--color-roo-line)"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
    </Sticker>
  );
}
