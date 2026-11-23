import type { DashboardPeriod } from "@/src/services/dashboard";

/** The API rejects a period that ends before it starts (`INVALID_DATE_RANGE`). */
export function isValidPeriod({ startDate, endDate }: DashboardPeriod): boolean {
  return !startDate || !endDate || startDate <= endDate;
}

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/** Counts, amounts, and percentages as the dashboard shows them: `1,710`, `243,000.5`. */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatPercent(value: number): string {
  return `${formatNumber(value)}%`;
}

/** `YYYY-MM` as a short month in the page's language, with the year when the range spans years. */
export function formatMonth(month: string, locale: string, withYear: boolean): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    ...(withYear && { year: "2-digit" }),
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

/** A service request's services as one line: `AC repair, Cleaning ×2`. */
export function describeServices(
  services: { name: string | null; quantity: number }[],
  unnamed: string,
): string {
  return services
    .map((service) => `${service.name ?? unnamed}${service.quantity > 1 ? ` ×${service.quantity}` : ""}`)
    .join(", ");
}
