export function formatPrice(pricePerDay: number | null): string {
  return pricePerDay === null ? "Free" : `$${pricePerDay}/day`;
}

export function formatMoney(amount: number | null): string {
  return amount === null ? "None" : `$${amount}`;
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
