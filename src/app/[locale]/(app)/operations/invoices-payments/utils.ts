import {
  buildCreateInvoiceBody,
  invoiceStatusIds,
  type CreateInvoiceBody,
} from "@/src/services/invoices";
import type { Unit } from "@/src/services/units";

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

// Generate Invoice

/** The Generate Invoice form as typed. */
export type GenerateInvoiceValues = {
  /** The chosen owned unit (from the unit search), with its owners. */
  unit: Unit | null;
  /** The owner the invoice is raised for: the unit's only owner, or the one chosen. */
  ownerId: number | null;
  /** One of the unit's project's invoice types. */
  invoiceTypeId: number | null;
  /** As typed; Arabic-Indic digits are accepted. */
  amount: string;
};

export type GenerateInvoiceProblem = "required" | "amount";
export type GenerateInvoiceErrors = Partial<
  Record<"unit" | "ownerId" | "invoiceTypeId" | "amount", GenerateInvoiceProblem>
>;

/** Arabic-Indic and Eastern Arabic-Indic digits (U+0660-0669, U+06F0-06F9). */
const ARABIC_DIGITS = /[٠-٩۰-۹]/g;
/** The Arabic decimal separator. */
const ARABIC_DECIMAL = "٫";

/**
 * The amount as a number, or null unless it is above zero with at most two decimals (the API
 * refuses zero for an invoice without a ticket). Arabic-Indic digits and the Arabic decimal
 * separator are read too; thousands separators are not.
 */
export function parseInvoiceAmount(text: string): number | null {
  const normalized = text
    .trim()
    .replace(ARABIC_DIGITS, (digit) => String(digit.charCodeAt(0) & 0xf))
    .replace(ARABIC_DECIMAL, ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export type ValidatedInvoice = { ok: true; body: CreateInvoiceBody } | { ok: false; errors: GenerateInvoiceErrors };

/** Every field is required: a unit, one of its owners, an invoice type and an amount above zero. */
export function validateGenerateInvoice(values: GenerateInvoiceValues): ValidatedInvoice {
  const errors: GenerateInvoiceErrors = {};
  const owner = values.unit?.owners.find((candidate) => candidate.customerId === values.ownerId) ?? null;
  if (!values.unit) errors.unit = "required";
  else if (!owner) errors.ownerId = "required";
  if (values.invoiceTypeId === null) errors.invoiceTypeId = "required";
  const amount = parseInvoiceAmount(values.amount);
  if (!values.amount.trim()) errors.amount = "required";
  else if (amount === null) errors.amount = "amount";

  if (Object.keys(errors).length > 0 || !values.unit || !owner || values.invoiceTypeId === null || amount === null) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    body: buildCreateInvoiceBody({
      projectId: values.unit.projectId,
      unitId: values.unit.id,
      unitNumber: values.unit.unitNumber,
      customerId: owner.customerId,
      customerName: owner.name,
      invoiceTypeId: values.invoiceTypeId,
      totalAmount: amount,
    }),
  };
}
