import { describe, expect, it } from "vitest";
import type { Unit } from "@/src/services/units";
import {
  cairoNow,
  emptyNewRequestForm,
  requesterOf,
  validateNewRequest,
  type NewRequestContext,
  type NewRequestFormValues,
} from "./utils";

const unit: Unit = {
  id: 14,
  unitNumber: "A-301",
  projectId: 2,
  projectName: "Marina Heights",
  subProjectCode: null,
  unitTypeName: "Apartment",
  floor: 3,
  isActive: true,
  owners: [
    { customerId: 7, name: "Ahmed Ali", contractNumber: null },
    { customerId: 8, name: "Sara Ali", contractNumber: null },
  ],
};

const context: NewRequestContext = {
  unit,
  owner: unit.owners[0],
  ownerMobile: "01000000000",
  service: { id: 5, name: "Plumbing visit", departmentId: 3, price: 150 },
  now: "2026-11-23 10:00",
};

const filled: NewRequestFormValues = {
  ...emptyNewRequestForm(),
  notes: "Leaking tap",
  departmentId: 3,
  serviceId: 5,
  quantity: "2",
  dueDate: "2026-11-24",
  dueTime: "09:30",
};

describe("validateNewRequest", () => {
  it("builds the request from the unit, its owner, the service's listed price and the due time", () => {
    expect(validateNewRequest(filled, context)).toEqual({
      ok: true,
      input: {
        projectId: 2,
        unitId: 14,
        unitNumber: "A-301",
        customerId: 7,
        customerName: "Ahmed Ali",
        customerMobile: "01000000000",
        departmentId: 3,
        requesterName: "Ahmed Ali",
        requesterMobile: "01000000000",
        arrivalTime: "2026-11-24 09:30",
        services: [{ serviceId: 5, quantity: 2, price: 150 }],
        notes: "Leaking tap",
      },
    });
  });

  it("sends an edited requester instead of the owner", () => {
    const result = validateNewRequest({ ...filled, requesterName: "Mona", requesterMobile: "01111111111" }, context);
    expect(result.ok && result.input).toMatchObject({ requesterName: "Mona", requesterMobile: "01111111111" });
  });

  it("flags every missing required field", () => {
    const result = validateNewRequest(emptyNewRequestForm(), {
      ...context,
      unit: null,
      owner: null,
      ownerMobile: null,
      service: null,
    });
    expect(result).toEqual({
      ok: false,
      errors: {
        unit: "required",
        departmentId: "required",
        serviceId: "required",
        requesterName: "required",
        requesterMobile: "required",
        dueDate: "required",
        dueTime: "required",
      },
    });
  });

  it("asks for an owner when the unit has several and none is chosen", () => {
    const result = validateNewRequest(filled, { ...context, owner: null });
    expect(result.ok ? null : result.errors.ownerId).toBe("required");
  });

  it("refuses an owner whose record has no mobile", () => {
    const result = validateNewRequest({ ...filled, requesterMobile: "01111111111" }, { ...context, ownerMobile: null });
    expect(result.ok ? null : result.errors).toEqual({ customer: "noMobile" });
  });

  it("refuses a service that isn't the chosen one (e.g. still loading another department's)", () => {
    const result = validateNewRequest({ ...filled, serviceId: 6 }, context);
    expect(result.ok ? null : result.errors.serviceId).toBe("required");
  });

  it("checks the requester mobile's 11 digits and a whole positive quantity", () => {
    const result = validateNewRequest({ ...filled, requesterMobile: "+20100000000", quantity: "1.5" }, context);
    expect(result.ok ? null : result.errors).toEqual({ requesterMobile: "mobile", quantity: "quantity" });
    const zero = validateNewRequest({ ...filled, quantity: "0" }, context);
    expect(zero.ok ? null : zero.errors).toEqual({ quantity: "quantity" });
  });

  it("refuses a due time already past in Cairo", () => {
    const result = validateNewRequest({ ...filled, dueDate: "2026-11-23", dueTime: "09:59" }, context);
    expect(result.ok ? null : result.errors).toEqual({ dueTime: "past" });
    expect(validateNewRequest({ ...filled, dueDate: "2026-11-23", dueTime: "10:00" }, context).ok).toBe(true);
  });
});

describe("requesterOf", () => {
  it("follows the owner until edited, even to an empty value", () => {
    expect(requesterOf(emptyNewRequestForm(), context)).toEqual({ name: "Ahmed Ali", mobile: "01000000000" });
    expect(requesterOf({ ...emptyNewRequestForm(), requesterName: "" }, context).name).toBe("");
  });
});

describe("cairoNow", () => {
  it("gives Cairo's clock time (UTC+2 in November)", () => {
    expect(cairoNow(new Date("2026-11-23T22:30:00Z"))).toBe("2026-11-24 00:30");
  });
});
