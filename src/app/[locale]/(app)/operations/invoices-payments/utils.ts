import { invoiceStatusIds } from "@/src/services/invoices";

const amountFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Amounts as plain numbers (`85,000`, `1,250.5`): the API sends no currency. */
export function formatAmount(value: number): string {
  return amountFormat.format(value);
}

export type StatusLook = { badge: string; dot: string };

const neutral: StatusLook = { badge: "border-gray-300 bg-gray-50 text-gray-600", dot: "bg-gray-400" };
const waiting: StatusLook = { badge: "border-yellow-300 bg-yellow-50 text-yellow-600", dot: "bg-yellow-500" };
const paid: StatusLook = { badge: "border-emerald-300 bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" };
const partly: StatusLook = { badge: "border-blue-300 bg-blue-50 text-blue-600", dot: "bg-blue-500" };
const stopped: StatusLook = { badge: "border-red-300 bg-red-50 text-red-500", dot: "bg-red-500" };
const requested: StatusLook = { badge: "border-orange-300 bg-orange-50 text-orange-600", dot: "bg-orange-500" };

const statusLooks: Record<number, StatusLook> = {
  [invoiceStatusIds.pending]: waiting,
  [invoiceStatusIds.underPaymentProcess]: waiting,
  [invoiceStatusIds.collected]: paid,
  [invoiceStatusIds.partiallyCollected]: partly,
  [invoiceStatusIds.void]: stopped,
  [invoiceStatusIds.refunded]: stopped,
  [invoiceStatusIds.partiallyRefunded]: stopped,
  [invoiceStatusIds.voidRequested]: requested,
  [invoiceStatusIds.refundRequested]: requested,
};

/** The badge colours for an invoice status id; grey for an id this app doesn't know. */
export function statusLook(statusId: number): StatusLook {
  return statusLooks[statusId] ?? neutral;
}

/** Initials for the customer's avatar, or null without a name. */
export function initials(name: string | null): string | null {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
