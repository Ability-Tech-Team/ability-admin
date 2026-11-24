import { describe, expect, it } from "vitest";
import type { Unit } from "@/src/services/units";
import {
  formatAmount,
  initials,
  parseInvoiceAmount,
  statusLook,
  validateGenerateInvoice,
  type GenerateInvoiceValues,
} from "./utils";

describe("formatAmount", () => {
  it("shows plain numbers with up to two decimals", () => {
    expect(formatAmount(85000)).toBe("85,000");
    expect(formatAmount(1250.5)).toBe("1,250.5");
    expect(formatAmount(0.125)).toBe("0.13");
  });
});

describe("initials", () => {
  it("takes the first letters of the first two words", () => {
    expect(initials("ahmed al rashidi")).toBe("AA");
    expect(initials("  Fatima ")).toBe("F");
    expect(initials(null)).toBeNull();
    expect(initials("   ")).toBeNull();
  });
});

describe("statusLook", () => {
  it("colours collected green and unknown ids grey", () => {
    expect(statusLook(2).dot).toBe("bg-emerald-500");
    expect(statusLook(99).dot).toBe("bg-gray-400");
  });
});

describe("parseInvoiceAmount", () => {
  it("reads amounts above zero with up to two decimals", () => {
    expect(parseInvoiceAmount(" 1250.5 ")).toBe(1250.5);
    expect(parseInvoiceAmount("85000")).toBe(85000);
    expect(parseInvoiceAmount("0.01")).toBe(0.01);
  });

  it("reads Arabic-Indic digits and the Arabic decimal separator", () => {
    expect(parseInvoiceAmount("١٢٥٫٥")).toBe(125.5);
    expect(parseInvoiceAmount("۳۰")).toBe(30);
  });

  it("refuses zero, negatives, three decimals, separators and text", () => {
    for (const text of ["", "0", "0.00", "-5", "1.005", "1,000", "abc", "1e3", "."]) {
      expect(parseInvoiceAmount(text)).toBeNull();
    }
  });
});

describe("validateGenerateInvoice", () => {
  const unit: Unit = {
    id: 12,
    unitNumber: "301",
    projectId: 2,
    projectName: "Marina Heights",
    subProjectCode: null,
    unitTypeName: null,
    floor: null,
    isActive: true,
    owners: [
      { customerId: 40, name: "Ahmed Al Rashidi", contractNumber: null },
      { customerId: 41, name: "Sara Al Rashidi", contractNumber: null },
    ],
  };
  const filled: GenerateInvoiceValues = { unit, ownerId: 41, invoiceTypeId: 3, amount: "1500" };

  it("builds the body for the unit's project and the chosen owner", () => {
    expect(validateGenerateInvoice(filled)).toEqual({
      ok: true,
      body: {
        project_id: 2,
        unit_id: 12,
        unit_number: "301",
        customer_id: 41,
        customer_name: "Sara Al Rashidi",
        invoice_type_id: 3,
        total_amount: 1500,
        request_from_id: 1,
      },
    });
  });

  it("flags every missing field", () => {
    expect(validateGenerateInvoice({ unit: null, ownerId: null, invoiceTypeId: null, amount: " " })).toEqual({
      ok: false,
      errors: { unit: "required", invoiceTypeId: "required", amount: "required" },
    });
  });

  it("asks for an owner of the unit and an amount above zero", () => {
    expect(validateGenerateInvoice({ ...filled, ownerId: null, amount: "0" })).toEqual({
      ok: false,
      errors: { ownerId: "required", amount: "amount" },
    });
    expect(validateGenerateInvoice({ ...filled, ownerId: 99 })).toEqual({ ok: false, errors: { ownerId: "required" } });
  });
});
