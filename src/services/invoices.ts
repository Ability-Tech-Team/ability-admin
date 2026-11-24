import { z } from "zod";
import {
  apiDownload,
  apiGet,
  apiPost,
  downloadFileName,
  type ApiQuery,
  type DownloadRequest,
  type DownloadedFile,
} from "@/src/lib/apiClient";

/**
 * Invoices and payments (`/admin/orders/invoices...`,
 * ability-crm-api/libs/domain/src/orders: `OrdersController`, `OrdersService`, `GetInvoiceDto`,
 * `CreateInvoiceDto`, `CreateInvoiceTransactionsDto`). Each call resolves with the adapted answer or throws:
 * `ApiError` (src/lib/apiClient.ts) when the API refuses or can't be reached,
 * `InvoicesAnswerError` when an answer doesn't have the expected shape.
 *
 * Amounts come without a currency; the screen shows plain numbers.
 */

export class InvoicesAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "InvoicesAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new InvoicesAnswerError(route);
  return parsed.data;
}

/**
 * Money columns are Prisma `Decimal`s, which JSON writes as strings (`"85000.00"`); the
 * computed figures (stats, refunded amounts) are numbers. Both are accepted.
 */
const money = z.union([
  z.number(),
  z
    .string()
    .regex(/^-?\d+(\.\d+)?$/)
    .transform(Number),
]);

// Invoice statuses: `invoiceStatusEnums` (libs/core/src/common/enums/shared.enum.ts). The admin
// API has no route listing them, so the filter offers these ids with translated labels.

export const invoiceStatusIds = {
  pending: 1,
  collected: 2,
  void: 3,
  underPaymentProcess: 4,
  voidRequested: 5,
  partiallyCollected: 6,
  refunded: 7,
  refundRequested: 8,
  partiallyRefunded: 9,
} as const;

export type InvoiceStatusKey = keyof typeof invoiceStatusIds;

export const invoiceStatusKeys = Object.keys(invoiceStatusIds) as InvoiceStatusKey[];

/** The catalog key for a status id, or null for an id this app doesn't know. */
export function invoiceStatusKey(statusId: number): InvoiceStatusKey | null {
  return invoiceStatusKeys.find((key) => invoiceStatusIds[key] === statusId) ?? null;
}

/** Statuses still waiting for money: pending, under payment process, partly collected. */
const payableStatusIds: readonly number[] = [
  invoiceStatusIds.pending,
  invoiceStatusIds.underPaymentProcess,
  invoiceStatusIds.partiallyCollected,
];

// Payment types: `paymentMethodEnums`. Online, sister company and estimated cost refund need
// details this screen doesn't collect, so it offers only these.

export const paymentMethodIds = { cash: 1, visa: 2, cheque: 5, instapay: 6 } as const;

export type PaymentMethodKey = keyof typeof paymentMethodIds;

export const paymentMethodKeys = Object.keys(paymentMethodIds) as PaymentMethodKey[];

// GET /orders/invoices

export type InvoiceFilters = {
  /** Invoice number, customer name, code or mobile, or unit number. */
  search: string;
  /** Whole-value match instead of "contains". */
  isExact: boolean;
  statusId: number | null;
  projectId: number | null;
  /** One of the chosen project's invoice types (`GET /definitions/all-dropdowns`). */
  invoiceTypeId: number | null;
};

/** The `GetInvoiceDto` query for the filters; the list, its stats and the export take the same one. */
export function invoiceFiltersQuery({ search, isExact, statusId, projectId, invoiceTypeId }: InvoiceFilters): ApiQuery {
  const term = search.trim();
  return {
    search: term,
    is_exact: term && isExact ? 1 : undefined,
    invoice_status_id: statusId,
    project_id: projectId,
    invoice_type_id: invoiceTypeId,
  };
}

export type Invoice = {
  /** The invoice's database id. */
  id: string;
  /** What people call the invoice (`invoice_number`), and what pay and change-status take. */
  invoiceNumber: string;
  customerName: string | null;
  projectId: number;
  /** In the request's language. */
  projectName: string | null;
  unitId: number | null;
  unitNumber: string;
  invoiceTypeName: string | null;
  totalAmount: number;
  /** What the invoice's payments add up to. */
  paidAmount: number;
  /** `YYYY-MM-DD`, the day it was raised. The API has no due date. */
  invoiceDate: string | null;
  statusId: number;
  /** In the request's language. */
  statusName: string | null;
};

export type InvoicePage = {
  invoices: Invoice[];
  totalCount: number;
  totalPages: number;
};

const invoiceSchema = z.object({
  id: z.string(),
  invoice_number: z.string(),
  customer_name: z.string().nullable(),
  project_id: z.number().int(),
  project_name: z.string().nullable(),
  unit_id: z.number().int().nullable(),
  unit_number: z.string(),
  invoice_type_name: z.string().nullable(),
  total_amount: money,
  invoice_date: z.string().nullable(),
  invoice_status_id: z.number().int(),
  invoice_status_name: z.string().nullable(),
  invoice_transactions: z.array(z.object({ total_amount: money })),
});

const invoicePageSchema = z.object({
  total_count: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
  invoices: z.array(invoiceSchema),
});

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function toInvoicePage(result: unknown): InvoicePage {
  const data = parse(invoicePageSchema, result, "invoices");
  return {
    totalCount: data.total_count,
    totalPages: data.total_pages,
    invoices: data.invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customerName: invoice.customer_name,
      projectId: invoice.project_id,
      projectName: invoice.project_name,
      unitId: invoice.unit_id,
      unitNumber: invoice.unit_number,
      invoiceTypeName: invoice.invoice_type_name,
      totalAmount: invoice.total_amount,
      paidAmount: roundMoney(
        invoice.invoice_transactions.reduce((sum, transaction) => sum + transaction.total_amount, 0),
      ),
      invoiceDate: invoice.invoice_date,
      statusId: invoice.invoice_status_id,
      statusName: invoice.invoice_status_name,
    })),
  };
}

/** What is still to pay on the invoice, never below zero. */
export function amountDue(invoice: Pick<Invoice, "totalAmount" | "paidAmount">): number {
  return Math.max(0, roundMoney(invoice.totalAmount - invoice.paidAmount));
}

/** Whether "Mark paid" applies: the invoice waits for money and some is still due. */
export function canRecordPayment(invoice: Pick<Invoice, "statusId" | "totalAmount" | "paidAmount">): boolean {
  return payableStatusIds.includes(invoice.statusId) && amountDue(invoice) > 0;
}

/** One page of invoices, newest first. `GetInvoiceDto` declares `page` and `limit`. */
export async function fetchInvoices(
  apiBaseUrl: string,
  filters: InvoiceFilters,
  page: number,
  limit: number,
  locale: string,
): Promise<InvoicePage> {
  const result = await apiGet(
    apiBaseUrl,
    "/orders/invoices",
    { ...invoiceFiltersQuery(filters), page, limit },
    { locale },
  );
  return toInvoicePage(result);
}

// GET /orders/invoices/stats

export type InvoiceStats = {
  /** Unpaid invoices' totals (pending, under payment, partly collected) less what was paid on them. */
  totalOutstanding: number;
  /** Payments dated in this Cairo month on collected and partly collected invoices. */
  collectedThisMonth: number;
};

const statsSchema = z.object({
  total_outstanding: z.number(),
  collected_this_month: z.number(),
});

export function toInvoiceStats(result: unknown): InvoiceStats {
  const data = parse(statsSchema, result, "invoice stats");
  return {
    totalOutstanding: data.total_outstanding,
    collectedThisMonth: data.collected_this_month,
  };
}

/** The figures above the list, for the same filters. */
export async function fetchInvoiceStats(
  apiBaseUrl: string,
  filters: InvoiceFilters,
  locale: string,
): Promise<InvoiceStats> {
  const result = await apiGet(apiBaseUrl, "/orders/invoices/stats", invoiceFiltersQuery(filters), {
    locale,
  });
  return toInvoiceStats(result);
}

// POST /orders/invoices

/** A new invoice ("Generate Invoice") for an owned unit and one of its owners. */
export type NewInvoice = {
  /** The unit's project: the admin API needs it for writes. */
  projectId: number;
  unitId: number;
  unitNumber: string;
  customerId: number;
  customerName: string;
  invoiceTypeId: number;
  totalAmount: number;
};

/**
 * Where the invoice comes from (`requestSourceEnums`, `request_sources`). The column is required
 * although the DTO marks it optional: without it the API answers `FAILED_CREATE_INVOICE`.
 * `COMMUNITY_ADMIN` (5) isn't seeded in `request_sources`, so an invoice raised by staff here is a
 * CRM one, as with complaints (`COMPLAINT_REQUEST_SOURCE_CRM`).
 */
export const INVOICE_REQUEST_SOURCE_CRM = 1;

/**
 * The `CreateInvoiceDto` body. The API sets the number, the date (today, Cairo) and the status
 * (Pending when none is sent), and takes the customer code from the customer.
 */
export function buildCreateInvoiceBody(invoice: NewInvoice) {
  return {
    project_id: invoice.projectId,
    unit_id: invoice.unitId,
    unit_number: invoice.unitNumber,
    customer_id: invoice.customerId,
    customer_name: invoice.customerName,
    invoice_type_id: invoice.invoiceTypeId,
    total_amount: invoice.totalAmount,
    request_from_id: INVOICE_REQUEST_SOURCE_CRM,
  };
}

export type CreateInvoiceBody = ReturnType<typeof buildCreateInvoiceBody>;

const createdInvoiceSchema = z.object({ invoice_number: z.string() }).loose();

/** Raises the invoice and resolves with its number. */
export async function createInvoice(
  apiBaseUrl: string,
  body: CreateInvoiceBody,
  locale: string,
  fetchImpl?: typeof fetch,
): Promise<{ invoiceNumber: string }> {
  const result = await apiPost(apiBaseUrl, "/orders/invoices", body, { locale, fetchImpl });
  return { invoiceNumber: parse(createdInvoiceSchema, result, "new invoice").invoice_number };
}

// POST /orders/invoices/transactions/pay

export type InvoicePayment = {
  invoice: Pick<Invoice, "invoiceNumber" | "projectId" | "unitId">;
  amount: number;
  paymentMethod: PaymentMethodKey;
  /** Optional; empty sends nothing. */
  referenceNumber: string;
};

/** The `CreateInvoiceTransactionsDto` body: one payment, made now. */
export function buildPaymentBody(
  { invoice, amount, paymentMethod, referenceNumber }: InvoicePayment,
  now: Date,
) {
  const reference = referenceNumber.trim();
  return {
    invoice_number: invoice.invoiceNumber,
    project_id: invoice.projectId,
    ...(invoice.unitId !== null && { unit_id: invoice.unitId }),
    transactions: [
      {
        total_amount: amount,
        payment_type_id: paymentMethodIds[paymentMethod],
        ...(reference && { reference_number: reference }),
        transaction_at: now.toISOString(),
      },
    ],
  };
}

const messageSchema = z.object({ message: z.string().optional() }).loose();

/** Records the payment; the API then marks the invoice collected. */
export async function payInvoice(
  apiBaseUrl: string,
  payment: InvoicePayment,
  locale: string,
): Promise<void> {
  const result = await apiPost(
    apiBaseUrl,
    "/orders/invoices/transactions/pay",
    buildPaymentBody(payment, new Date()),
    { locale },
  );
  parse(messageSchema, result, "invoice payment");
}

// GET /orders/invoices?is_excel=1

export type InvoicesSheet = DownloadedFile;

/** The file name from `Content-Disposition` (the API exposes that header), else `invoices.xlsx`. */
export function sheetFileName(contentDisposition: string | null): string {
  return downloadFileName(contentDisposition, "invoices.xlsx");
}

/** The export request: every invoice matching the filters, as the API's Excel sheet. */
export function invoicesSheetRequest(filters: InvoiceFilters): DownloadRequest {
  return {
    path: "/orders/invoices",
    query: { ...invoiceFiltersQuery(filters), is_excel: 1 },
    fallbackName: "invoices.xlsx",
  };
}

/** Downloads that sheet (see `apiDownload`): a refusal still throws an `ApiError`. */
export async function downloadInvoicesSheet(
  apiBaseUrl: string,
  filters: InvoiceFilters,
  locale: string,
  fetchImpl: typeof fetch = fetch,
): Promise<InvoicesSheet> {
  return apiDownload(apiBaseUrl, invoicesSheetRequest(filters), { locale, fetchImpl });
}
