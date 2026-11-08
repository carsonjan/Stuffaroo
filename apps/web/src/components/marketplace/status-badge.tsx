import type { AvailabilityStatus, RentalStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const pill =
  "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-ink";

const availability: Record<
  AvailabilityStatus,
  { label: string; className: string }
> = {
  available: { label: "Available", className: "bg-tint-mint" },
  on_loan: { label: "On loan", className: "bg-tint-butter" },
  paused: { label: "Paused", className: "bg-pebble" },
};

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  const { label, className } = availability[status];
  return <span className={cn(pill, className)}>{label}</span>;
}

const rental: Record<RentalStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-tint-butter" },
  accepted: { label: "Accepted", className: "bg-tint-mint" },
  active: { label: "Active", className: "bg-tint-blue" },
  completed: { label: "Completed", className: "bg-paper-3" },
  rejected: { label: "Rejected", className: "bg-pebble" },
  cancelled: { label: "Cancelled", className: "bg-paper-3 text-ink-3" },
};

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  const { label, className } = rental[status];
  return <span className={cn(pill, className)}>{label}</span>;
}
