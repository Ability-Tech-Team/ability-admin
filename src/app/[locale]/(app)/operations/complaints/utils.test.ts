import { describe, expect, it } from "vitest";
import type { Unit } from "@/src/services/units";
import {
  buildCreateComplaintBody,
  defaultComplaintStatusId,
  effectiveComplaintStatusId,
  emptyComplaintForm,
  localDate,
  validateComplaintForm,
  type ComplaintFormContext,
} from "./utils";

const unit: Unit = {
  id: 31,
  unitNumber: "A-301",
  projectId: 2,
  projectName: "Marina",
  subProjectCode: null,
  unitTypeName: null,
  floor: 3,
  isActive: true,
  owners: [
    { customerId: 77, name: "Ahmed Ali", contractNumber: null },
    { customerId: 78, name: "Mona Ali", contractNumber: null },
  ],
};

const statuses = [
  { id: 1, name: "Open" },
  { id: 2, name: "In progress" },
  { id: 3, name: "Resolved" },
  { id: 4, name: "Rejected" },
];

const context: ComplaintFormContext = {
  unit,
  owner: unit.owners[1],
  types: [
    { id: 5, name: "Noise", departmentId: 9 },
    { id: 6, name: "Other", departmentId: null },
  ],
  statuses,
};

const filled = { typeId: 5, details: "  Loud music after midnight  ", statusId: null, date: "2026-11-23" };

describe("localDate", () => {
  it("formats the browser's own calendar day", () => {
    expect(localDate(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});

describe("emptyComplaintForm", () => {
  it("starts empty, dated the day given, with the default status", () => {
    expect(emptyComplaintForm("2026-11-23")).toEqual({ typeId: null, details: "", statusId: null, date: "2026-11-23" });
  });
});

describe("defaultComplaintStatusId", () => {
  it("starts a complaint as Open", () => {
    expect(defaultComplaintStatusId(statuses)).toBe(1);
  });

  it("falls back to the first status when Open isn't listed, and to none without a list", () => {
    expect(defaultComplaintStatusId([{ id: 2, name: "In progress" }])).toBe(2);
    expect(defaultComplaintStatusId([])).toBeNull();
  });

  it("keeps a status that was chosen", () => {
    expect(effectiveComplaintStatusId({ ...filled, statusId: 2 }, statuses)).toBe(2);
    expect(effectiveComplaintStatusId(filled, statuses)).toBe(1);
  });
});

describe("buildCreateComplaintBody", () => {
  it("sends CreateComplainDto's fields: the unit's project, the owner as customer, the type's department", () => {
    expect(
      buildCreateComplaintBody({
        unit,
        owner: unit.owners[0],
        type: { id: 5, name: "Noise", departmentId: 9 },
        statusId: 1,
        details: " Leak ",
        date: "2026-11-23",
      }),
    ).toEqual({
      project_id: 2,
      unit_id: 31,
      unit_number: "A-301",
      customer_id: 77,
      customer_name: "Ahmed Ali",
      type_id: 5,
      department_id: 9,
      status_id: 1,
      details: "Leak",
      complain_date: "2026-11-23",
      request_from_id: 1,
    });
  });

  it("leaves the department out when the type has none (the DTO refuses null)", () => {
    const body = buildCreateComplaintBody({
      unit,
      owner: unit.owners[0],
      type: { id: 6, name: "Other", departmentId: null },
      statusId: 1,
      details: "Leak",
      date: "2026-11-23",
    });
    expect(body).not.toHaveProperty("department_id");
  });
});

describe("validateComplaintForm", () => {
  it("builds the body from a complete form, with the default status", () => {
    const checked = validateComplaintForm(filled, context);
    expect(checked).toEqual({
      ok: true,
      body: expect.objectContaining({
        customer_id: 78,
        customer_name: "Mona Ali",
        type_id: 5,
        department_id: 9,
        status_id: 1,
        details: "Loud music after midnight",
      }),
    });
  });

  it("flags every missing field", () => {
    const checked = validateComplaintForm(
      { typeId: null, details: "   ", statusId: null, date: "" },
      { unit: null, owner: null, types: [], statuses: [] },
    );
    expect(checked).toEqual({
      ok: false,
      errors: { type: "required", details: "required", unit: "required", status: "required", date: "required" },
    });
  });

  it("asks for the owner when a unit with several has none chosen, or one of another unit", () => {
    expect(validateComplaintForm(filled, { ...context, owner: null })).toEqual({ ok: false, errors: { owner: "required" } });
    expect(
      validateComplaintForm(filled, { ...context, owner: { customerId: 1, name: "Someone else", contractNumber: null } }),
    ).toEqual({ ok: false, errors: { owner: "required" } });
  });

  it("refuses a type or status that isn't in the unit's project's lists", () => {
    expect(validateComplaintForm({ ...filled, typeId: 99 }, context)).toEqual({ ok: false, errors: { type: "required" } });
    expect(validateComplaintForm({ ...filled, statusId: 99 }, context)).toEqual({ ok: false, errors: { status: "required" } });
  });

  it("keeps the details within the DTO's 255 characters", () => {
    expect(validateComplaintForm({ ...filled, details: "x".repeat(255) }, context).ok).toBe(true);
    expect(validateComplaintForm({ ...filled, details: "x".repeat(256) }, context)).toEqual({
      ok: false,
      errors: { details: "tooLong" },
    });
  });

  it("refuses a date that isn't a real day", () => {
    expect(validateComplaintForm({ ...filled, date: "2026-02-30" }, context)).toEqual({ ok: false, errors: { date: "required" } });
    expect(validateComplaintForm({ ...filled, date: "23/11/2026" }, context)).toEqual({ ok: false, errors: { date: "required" } });
  });
});
