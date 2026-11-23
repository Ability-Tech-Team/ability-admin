import { describe, expect, it } from "vitest";
import { OWNERSHIP_OWNER, OWNERSHIP_RENTER } from "@/src/services/unitAssignments";
import {
  emptyAssignForm,
  initials,
  otherHolderCount,
  ownershipFromFilter,
  todayIso,
  validateAssignForm,
} from "./utils";

describe("ownershipFromFilter", () => {
  it("maps one ticked type to ownerShipTypeEnums and lists both otherwise", () => {
    expect(ownershipFromFilter(new Set(["owner"]))).toBe(OWNERSHIP_OWNER);
    expect(ownershipFromFilter(new Set(["tenant"]))).toBe(OWNERSHIP_RENTER);
    expect(ownershipFromFilter(new Set(["owner", "tenant"]))).toBeUndefined();
    expect(ownershipFromFilter(new Set())).toBeUndefined();
  });
});

describe("display helpers", () => {
  it("makes initials and counts the other holders", () => {
    expect(initials(" mariam al rashidi ")).toBe("MA");
    expect(otherHolderCount(10, [{ id: 10 }, { id: 11 }, { id: 12 }])).toBe(2);
    expect(otherHolderCount(10, [])).toBe(0);
  });

  it("writes today as YYYY-MM-DD", () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("validateAssignForm", () => {
  const customer = { id: 10, name: "Ahmed", idNumber: "298", mobileNumber: null };

  it("asks for the required fields", () => {
    expect(validateAssignForm(emptyAssignForm("", ""))).toEqual({
      ok: false,
      errors: {
        projectId: "required",
        unitNumber: "required",
        customer: "required",
        contractNumber: "required",
        signDate: "required",
        startDate: "required",
      },
    });
  });

  it("refuses an end before the start", () => {
    const values = {
      ...emptyAssignForm("3", "2026-11-02"),
      unitNumber: "301",
      customer,
      contractNumber: "C-1",
      endDate: "2026-11-01",
    };
    expect(validateAssignForm(values)).toEqual({ ok: false, errors: { endDate: "endBeforeStart" } });
  });

  it("builds the input", () => {
    const values = {
      ...emptyAssignForm("3", "2026-11-02"),
      unitNumber: "301",
      customer,
      ownershipId: OWNERSHIP_RENTER,
      contractNumber: "C-1",
    } as const;
    expect(validateAssignForm(values)).toEqual({
      ok: true,
      input: {
        customerId: 10,
        projectId: 3,
        unitNumber: "301",
        ownershipId: 2,
        contractNumber: "C-1",
        signDate: "2026-11-02",
        startDate: "2026-11-02",
        endDate: "",
      },
    });
  });
});
