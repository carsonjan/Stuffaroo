"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { CampusMapPin } from "./campus-map";

const PIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] ?? c,
  );
}

const SIDE_CLASS = {
  center: "-translate-x-1/2",
  left: "-translate-x-[calc(100%-1rem)]",
  right: "-translate-x-4",
};

/** The same frosted pill the stylised map used, centred on the spot unless a side is given. */
function pillIcon(pin: CampusMapPin) {
  const count =
    pin.count === null
      ? ""
      : `<span class="num text-ink-2">${pin.count}</span>`;
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    html: `<span class="frost t-label press absolute flex ${SIDE_CLASS[pin.side ?? "center"]} -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-pill py-2 pr-3.5 pl-2.5 text-ink shadow-float cursor-pointer">${PIN_ICON}${escapeHtml(pin.name)}${count}</span>`,
  });
}

/** Fits the pins with room for their pills, scaled to the map's width. */
function FitToPins({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    const fit = () => {
      const { x } = map.getSize();
      map.fitBounds(bounds, {
        paddingTopLeft: [Math.min(96, x * 0.24), 44],
        paddingBottomRight: [Math.min(132, x * 0.32), 44],
      });
    };
    fit();
    map.on("resize", fit);
    return () => {
      map.off("resize", fit);
    };
  }, [map, bounds]);
  return null;
}

/** UBC Vancouver campus, framed around the pickup spots. */
export function CampusMapLeaflet({ pins }: { pins: CampusMapPin[] }) {
  const router = useRouter();
  const bounds = useMemo(
    () => L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])),
    [pins],
  );

  return (
    <MapContainer
      bounds={bounds}
      zoomSnap={0.25}
      maxBounds={bounds.pad(2.5)}
      minZoom={14}
      maxZoom={18}
      scrollWheelZoom={false}
      dragging={!L.Browser.mobile}
      attributionControl
      className="absolute inset-0 z-0 size-full"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        className="saturate-[.35]"
      />
      <FitToPins bounds={bounds} />
      {pins.map((pin) => (
        <Marker
          key={pin.slug}
          position={[pin.lat, pin.lng]}
          icon={pillIcon(pin)}
          title={
            pin.count === null ? pin.name : `${pin.name}, ${pin.count} items`
          }
          alt={pin.name}
          eventHandlers={{ click: () => router.push(pin.href) }}
        />
      ))}
    </MapContainer>
  );
}
