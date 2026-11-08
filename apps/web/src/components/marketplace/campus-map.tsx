"use client";

import dynamic from "next/dynamic";

export type CampusMapPin = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  side?: "left" | "right";
  href: string;
  count: number | null;
};

/** Leaflet touches `window` on import, so the map only renders in the browser. */
export const CampusMap = dynamic(
  () => import("./campus-map-leaflet").then((m) => m.CampusMapLeaflet),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-surface" aria-hidden />,
  },
);
