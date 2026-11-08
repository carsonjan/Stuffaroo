export function formatPrice(pricePerDay: number | null): string {
  return pricePerDay === null ? "Free" : `$${pricePerDay}/day`;
}

export function formatMoney(amount: number | null): string {
  return amount === null ? "None" : `$${amount}`;
}

function centsToText(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rest = cents % 100;
  return rest === 0
    ? `$${dollars}`
    : `$${dollars}.${String(rest).padStart(2, "0")}`;
}

/** Per-day price from API cents. null means free to borrow. */
export function formatPriceCents(cents: number | null): string {
  return cents === null ? "Free" : `${centsToText(cents)}/day`;
}

/** A one-off amount from API cents, such as a deposit. */
export function formatMoneyCents(cents: number | null): string {
  return cents === null ? "None" : centsToText(cents);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatDateRange(start: string, end: string): string {
  return start === end
    ? formatDate(start)
    : `${formatDate(start)} – ${formatDate(end)}`;
}

export function daysBetween(start: string, end: string): number {
  const ms =
    new Date(`${end}T00:00:00Z`).getTime() -
    new Date(`${start}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000) + 1;
}
