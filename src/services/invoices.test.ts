import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/src/lib/apiClient";
import {
  InvoicesAnswerError,
  amountDue,
  buildCreateInvoiceBody,
  buildPaymentBody,
  canRecordPayment,
  createInvoice,
  downloadInvoicesSheet,
  invoiceFiltersQuery,
  invoiceStatusKey,
  sheetFileName,
  toInvoicePage,
  toInvoiceStats,
  type InvoiceFilters,
} from "./invoices";

// Answers shaped like ability-crm-api/libs/domain/src/orders/orders.service.ts
// (formatInvoiceListRecord, getInvoices, getInvoiceStats) and
// libs/domain/src/company-projects/company-projects.service.ts (getProjects). Money columns are
// Prisma Decimals, which JSON writes as strings.

const noFilters: InvoiceFilters = { search: "", isExact: false, statusId: null, projectId: null, invoiceTypeId: null };

function invoiceRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "4521",
    unit_number: "301",
    customer_code: null,
    invoice_number: "INV-1-26112210-4521",
    project_id: 1,
    ticket_id: null,
    invoice_type_id: 3,
    invoice_status_id: 6,
    total_amount: "85000.00",
    has_runner_cashier: 0,
    runner_cashier_price: "0",
    created_by: "Mona Adel",
    updated_by: null,
    notes: null,
    invoice_date: "2026-11-22",
    request_from_id: 5,
    customer_name: "Ahmed Al Rashidi",
    customer_mobile: "01000000000",
    unit_id: 12,
    customer_id: 40,
    contact_channel_id: null,
    invoice_status_name: "Partially Collected",
    invoice_type_name: "Annual Rent",
    project_name: "Marina Heights",
    contact_channel_name: null,
    invoice_created_by: "Mona Adel",
    invoice_collected_by: null,
    logs: [],
    has_void_request: null,
    has_void: null,
    created_at: "2026-11-22 10:15",
    collected_date: null,
    refunded_amount: 0,
    remaining_amount: 85000,
    settlement: [],
    invoice_types: "Annual Rent",
    invoice_transactions: [
      { id: "1", invoice_id: "4521", total_amount: "20000.50", payment_type_id: 1, transaction_at: "2026-11-22 10:20:00" },
      { id: "2", invoice_id: "4521", total_amount: "10000.25", payment_type_id: 2, transaction_at: "2026-11-22 10:21:00" },
    ],
    ...overrides,
  };
}

describe("toInvoicePage", () => {
  it("adapts the list answer, reading Decimal strings as numbers", () => {
    const page = toInvoicePage({ total_count: 31, total_pages: 4, invoices: [invoiceRecord()] });
    expect(page).toEqual({
      totalCount: 31,
      totalPages: 4,
      invoices: [
        {
          id: "4521",
          invoiceNumber: "INV-1-26112210-4521",
          customerName: "Ahmed Al Rashidi",
          projectId: 1,
          projectName: "Marina Heights",
          unitId: 12,
          unitNumber: "301",
          invoiceTypeName: "Annual Rent",
          totalAmount: 85000,
          paidAmount: 30000.75,
          invoiceDate: "2026-11-22",
          statusId: 6,
          statusName: "Partially Collected",
        },
      ],
    });
  });

  it("accepts the empty page and numeric amounts", () => {
    expect(toInvoicePage({ total_count: 0, total_pages: 1, invoices: [] })).toEqual({
      totalCount: 0,
      totalPages: 1,
      invoices: [],
    });
    const page = toInvoicePage({
      total_count: 1,
      total_pages: 1,
      invoices: [invoiceRecord({ total_amount: 1200, invoice_transactions: [], customer_name: null, unit_id: null })],
    });
    expect(page.invoices[0]).toMatchObject({ totalAmount: 1200, paidAmount: 0, customerName: null, unitId: null });
  });

  it("rejects an answer without totals or with a malformed amount", () => {
    expect(() => toInvoicePage({ invoices: [] })).toThrow(InvoicesAnswerError);
    expect(() =>
      toInvoicePage({ total_count: 1, total_pages: 1, invoices: [invoiceRecord({ total_amount: "abc" })] }),
    ).toThrow(InvoicesAnswerError);
  });
});

describe("toInvoiceStats", () => {
  it("adapts the stats answer", () => {
    expect(toInvoiceStats({ total_outstanding: 118000.5, collected_this_month: 125000 })).toEqual({
      totalOutstanding: 118000.5,
      collectedThisMonth: 125000,
    });
  });

  it("rejects a missing figure instead of showing zero", () => {
    expect(() => toInvoiceStats({ total_outstanding: 1 })).toThrow(InvoicesAnswerError);
  });
});

describe("invoiceFiltersQuery", () => {
  it("sends only the filters that are set", () => {
    expect(invoiceFiltersQuery(noFilters)).toEqual({
      search: "",
      is_exact: undefined,
      invoice_status_id: null,
      project_id: null,
      invoice_type_id: null,
    });
  });

  it("trims the search and sends is_exact only with a search", () => {
    expect(
      invoiceFiltersQuery({ search: "  INV-1 ", isExact: true, statusId: 2, projectId: 7, invoiceTypeId: 3 }),
    ).toEqual({
      search: "INV-1",
      is_exact: 1,
      invoice_status_id: 2,
      project_id: 7,
      invoice_type_id: 3,
    });
    expect(invoiceFiltersQuery({ ...noFilters, isExact: true }).is_exact).toBeUndefined();
  });
});

describe("invoice statuses", () => {
  it("maps the backend's ids to catalog keys", () => {
    expect(invoiceStatusKey(1)).toBe("pending");
    expect(invoiceStatusKey(6)).toBe("partiallyCollected");
    expect(invoiceStatusKey(9)).toBe("partiallyRefunded");
    expect(invoiceStatusKey(42)).toBeNull();
  });

  it("offers Mark paid only on unpaid invoices with something due", () => {
    const due = { totalAmount: 100, paidAmount: 40 };
    expect(canRecordPayment({ ...due, statusId: 1 })).toBe(true);
    expect(canRecordPayment({ ...due, statusId: 4 })).toBe(true);
    expect(canRecordPayment({ ...due, statusId: 6 })).toBe(true);
    expect(canRecordPayment({ ...due, statusId: 2 })).toBe(false);
    expect(canRecordPayment({ ...due, statusId: 3 })).toBe(false);
    expect(canRecordPayment({ totalAmount: 100, paidAmount: 100, statusId: 6 })).toBe(false);
  });

  it("rounds the amount due and never goes below zero", () => {
    expect(amountDue({ totalAmount: 0.3, paidAmount: 0.1 })).toBe(0.2);
    expect(amountDue({ totalAmount: 10, paidAmount: 12 })).toBe(0);
  });
});

describe("buildPaymentBody", () => {
  const now = new Date("2026-11-22T08:30:00.000Z");
  const invoice = { invoiceNumber: "INV-1", projectId: 1, unitId: 12 };

  it("builds one payment made now", () => {
    expect(
      buildPaymentBody({ invoice, amount: 54999.25, paymentMethod: "visa", referenceNumber: " R-77 " }, now),
    ).toEqual({
      invoice_number: "INV-1",
      project_id: 1,
      unit_id: 12,
      transactions: [
        { total_amount: 54999.25, payment_type_id: 2, reference_number: "R-77", transaction_at: "2026-11-22T08:30:00.000Z" },
      ],
    });
  });

  it("leaves out an empty reference and a missing unit", () => {
    const body = buildPaymentBody(
      { invoice: { ...invoice, unitId: null }, amount: 10, paymentMethod: "cash", referenceNumber: "  " },
      now,
    );
    expect(body).not.toHaveProperty("unit_id");
    expect(body.transactions[0]).toEqual({ total_amount: 10, payment_type_id: 1, transaction_at: now.toISOString() });
  });
});

describe("buildCreateInvoiceBody", () => {
  it("builds the CreateInvoiceDto body for the unit's project and owner", () => {
    expect(
      buildCreateInvoiceBody({
        projectId: 2,
        unitId: 12,
        unitNumber: "301",
        customerId: 40,
        customerName: "Ahmed Al Rashidi",
        invoiceTypeId: 3,
        totalAmount: 1250.5,
      }),
    ).toEqual({
      project_id: 2,
      unit_id: 12,
      unit_number: "301",
      customer_id: 40,
      customer_name: "Ahmed Al Rashidi",
      invoice_type_id: 3,
      total_amount: 1250.5,
      request_from_id: 1,
    });
  });
});

describe("createInvoice", () => {
  const body = buildCreateInvoiceBody({
    projectId: 2,
    unitId: 12,
    unitNumber: "301",
    customerId: 40,
    customerName: "Ahmed",
    invoiceTypeId: 3,
    totalAmount: 100,
  });

  it("posts the body and returns the new invoice's number", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        result: { message: "Invoice created successfully", invoice_number: "INV-2-26112310-7" },
        success: true,
        statusCode: 201,
      }),
    );
    await expect(createInvoice("https://api.example/admin", body, "en", fetchImpl)).resolves.toEqual({
      invoiceNumber: "INV-2-26112310-7",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/admin/orders/invoices",
      expect.objectContaining({ method: "POST", credentials: "include", body: JSON.stringify(body) }),
    );
  });

  it("rejects an answer without the invoice number", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ result: { message: "ok" }, success: true, statusCode: 201 }),
    );
    await expect(createInvoice("https://api.example/admin", body, "en", fetchImpl)).rejects.toBeInstanceOf(
      InvoicesAnswerError,
    );
  });

  it("throws the API's refusal", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json(
        {
          result: { message: "Invoice amount must be greater than zero", message_code: "INVOICE_AMOUNT_MUST_BE_GREATER_THAN_ZERO" },
          success: false,
          statusCode: 400,
        },
        { status: 400 },
      ),
    );
    await expect(createInvoice("https://api.example/admin", body, "en", fetchImpl)).rejects.toBeInstanceOf(ApiError);
  });
});

describe("downloadInvoicesSheet", () => {
  it("asks for the Excel sheet with the filters and returns the file", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(new Blob(["xlsx"]), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="invoices-2026-11-22.xlsx"',
        },
      }),
    );
    const sheet = await downloadInvoicesSheet(
      "https://api.example/admin",
      { ...noFilters, statusId: 2, projectId: 2, invoiceTypeId: 5 },
      "ar",
      fetchImpl,
    );
    expect(sheet.fileName).toBe("invoices-2026-11-22.xlsx");
    expect(await sheet.blob.text()).toBe("xlsx");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/admin/orders/invoices?invoice_status_id=2&project_id=2&invoice_type_id=5&is_excel=1",
      expect.objectContaining({ credentials: "include", headers: { "Accept-Language": "ar", lang: "ar" } }),
    );
  });

  it("throws the API's refusal from the envelope", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json(
        { result: { message: "Session expired", message_code: "AUTH_UNAUTHORIZED" }, success: false, statusCode: 401 },
        { status: 401 },
      ),
    );
    const failure = await downloadInvoicesSheet("https://api.example/admin", noFilters, "en", fetchImpl).catch(
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({ status: 401, code: "AUTH_UNAUTHORIZED", kind: "session_ended" });
  });

  it("reports an unreachable API", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("network");
    });
    await expect(downloadInvoicesSheet("https://api.example/admin", noFilters, "en", fetchImpl)).rejects.toMatchObject({
      kind: "unreachable",
    });
  });
});

describe("sheetFileName", () => {
  it("reads the file name, else uses a default", () => {
    expect(sheetFileName('attachment; filename="a.xlsx"')).toBe("a.xlsx");
    expect(sheetFileName("attachment; filename=b.xlsx")).toBe("b.xlsx");
    expect(sheetFileName(null)).toBe("invoices.xlsx");
  });
});
