"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/** The 34px frosted heart on a listing photo. Demo only: saving lives in this tab's state. */
export function SaveButton({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      onClick={() => setSaved((s) => !s)}
      className={cn(
        "frost press flex size-[34px] items-center justify-center rounded-full text-ink",
        className,
      )}
    >
      <Heart
        className={cn("size-4", saved && "fill-roo text-roo")}
        strokeWidth={1.75}
        aria-hidden
      />
    </button>
  );
}
