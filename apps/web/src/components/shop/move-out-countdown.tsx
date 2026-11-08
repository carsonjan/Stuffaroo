"use client";

import { useEffect, useState } from "react";

import { MOVE_OUT_DATE, SAMPLE_TODAY } from "@/lib/mock-shop";

function daysUntil(from: Date, to: string): number {
  const target = new Date(`${to}T00:00:00`);
  return Math.max(
    0,
    Math.ceil((target.getTime() - from.getTime()) / 86_400_000),
  );
}

/** Days until April move-out. Renders from the sample date, then switches to today's date once mounted. */
export function MoveOutDays({ className }: { className?: string }) {
  const [days, setDays] = useState(() =>
    daysUntil(new Date(`${SAMPLE_TODAY}T00:00:00`), MOVE_OUT_DATE),
  );
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setDays(daysUntil(new Date(), MOVE_OUT_DATE)),
    );
    return () => cancelAnimationFrame(frame);
  }, []);
  return <span className={className}>{days}</span>;
}
