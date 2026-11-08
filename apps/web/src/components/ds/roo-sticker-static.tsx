import { Sticker } from "./sticker";

/**
 * Roo as a static die-cut circle sticker: the same orange head, pointed ears,
 * cheeks and glossy eyes as the peeking hero Roo (`components/roo.tsx`), drawn
 * whole and without motion. For empty states and success screens.
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
        viewBox="8 2 104 104"
        style={{ width: size, height: size }}
        className="block"
        aria-hidden
      >
        <defs>
          {/* Same gradients as the hero Roo; ids are prefixed so both can share a page */}
          <radialGradient id="roo-static-fur" cx="0.42" cy="0.3" r="0.75">
            <stop offset="0" stopColor="#ffb07a" />
            <stop offset="0.55" stopColor="#f58a44" />
            <stop offset="1" stopColor="#e2692a" />
          </radialGradient>
          <linearGradient id="roo-static-ear-in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffb3bd" />
            <stop offset="1" stopColor="#ff8fa0" />
          </linearGradient>
        </defs>

        {/* ears: tall and pointed, tilted out */}
        <path
          d="M47 50 C 37 38, 34 18, 39 9 C 47 15, 53 33, 54 48 Z"
          fill="url(#roo-static-fur)"
        />
        <path
          d="M47.5 46 C 41 36, 39.5 23, 41.5 16 C 46.5 22, 50 34, 50.5 45 Z"
          fill="url(#roo-static-ear-in)"
        />
        <path
          d="M73 50 C 83 38, 86 18, 81 9 C 73 15, 67 33, 66 48 Z"
          fill="url(#roo-static-fur)"
        />
        <path
          d="M72.5 46 C 79 36, 80.5 23, 78.5 16 C 73.5 22, 70 34, 69.5 45 Z"
          fill="url(#roo-static-ear-in)"
        />

        {/* head */}
        <ellipse cx="60" cy="72" rx="31" ry="27" fill="url(#roo-static-fur)" />
        <ellipse cx="54" cy="56" rx="12" ry="6" fill="#fff" opacity="0.18" />

        {/* cheeks */}
        <ellipse
          cx="39"
          cy="76"
          rx="5.5"
          ry="3.2"
          fill="#ff7f8f"
          opacity="0.45"
        />
        <ellipse
          cx="81"
          cy="76"
          rx="5.5"
          ry="3.2"
          fill="#ff7f8f"
          opacity="0.45"
        />

        {/* eyes */}
        {[48, 72].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="66" rx="4.4" ry="5.4" fill="#2a1712" />
            <circle cx={x + 1.5} cy="63.8" r="1.6" fill="#fff" />
            <circle cx={x - 1.3} cy="68.2" r="0.7" fill="#fff" opacity="0.7" />
          </g>
        ))}
        {/* brows */}
        <path
          d="M43.5 57.5 Q 47.5 55.2 51.5 56.8"
          fill="none"
          stroke="#b9541c"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M68.5 56.8 Q 72.5 55.2 76.5 57.5"
          fill="none"
          stroke="#b9541c"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* muzzle, nose and a small smile */}
        <ellipse cx="60" cy="84" rx="14" ry="9" fill="#ffdcbc" />
        <ellipse cx="60" cy="78.6" rx="4.4" ry="2.9" fill="#3a1f17" />
        <ellipse
          cx="58.9"
          cy="77.7"
          rx="1.4"
          ry="0.8"
          fill="#fff"
          opacity="0.6"
        />
        <path
          d="M55 85 Q 57.5 88 60 85.4 Q 62.5 88 65 85"
          fill="none"
          stroke="#3a1f17"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </Sticker>
  );
}
