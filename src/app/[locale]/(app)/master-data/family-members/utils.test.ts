import { describe, expect, it } from "vitest";
import { RELATIVE_ID_TYPE, buildAddRelativeBody } from "@/src/services/familyMembers";
import type { Unit } from "@/src/services/units";
import { defaultOwnerId, emptyRelativeForm, validateRelativeForm } from "./utils";

const unit = (owners: number[]): Unit => ({
  id: 41,
  unitNumber: "A-301",
  projectId: 2,
  projectName: "Marina Heights",
  subProjectCode: null,
  unitTypeName: null,
  floor: null,
  isActive: true,
  owners: owners.map((customerId) => ({ customerId, name: `Owner ${customerId}`, contractNumber: null })),
});

const filled = {
  ...emptyRelativeForm(),
  name: " Mariam Al Rashidi ",
  idNumber: "29801011234567",
  mobile: "01012345678",
  email: "mariam@example.com",
  unit: unit([9]),
  ownerId: 9,
  relation: "Spouse",
};

describe("validateRelativeForm", () => {
  it("needs the marked fields and a unit", () => {
    expect(validateRelativeForm(emptyRelativeForm())).toEqual({
      ok: false,
      errors: { name: "required", idNumber: "required", mobile: "required", email: "required", unit: "required" },
    });
  });

  it("needs an owner of the chosen unit", () => {
    expect(validateRelativeForm({ ...filled, unit: unit([9, 10]), ownerId: null })).toMatchObject({
      ok: false,
      errors: { ownerId: "required" },
    });
    expect(validateRelativeForm({ ...filled, ownerId: 77 })).toMatchObject({ ok: false, errors: { ownerId: "required" } });
  });

  it("checks the email's shape", () => {
    expect(validateRelativeForm({ ...filled, email: "mariam" })).toMatchObject({ ok: false, errors: { email: "email" } });
  });

  it("turns a complete form into the request, in the unit's project", () => {
    const result = validateRelativeForm({ ...filled, idType: "passport" });
    expect(result).toMatchObject({
      ok: true,
      input: { projectId: 2, unitId: 41, ownerId: 9, idType: RELATIVE_ID_TYPE.passport },
    });
  });
});

describe("defaultOwnerId", () => {
  it("preselects a unit's only owner, and asks when there are several", () => {
    expect(defaultOwnerId(unit([9]))).toBe(9);
    expect(defaultOwnerId(unit([9, 10]))).toBeNull();
    expect(defaultOwnerId(null)).toBeNull();
  });
});

describe("buildAddRelativeBody", () => {
  it("sends AddRelativeDto, trimmed, without empty optional text", () => {
    const checked = validateRelativeForm({ ...filled, relation: "  " });
    if (!checked.ok) throw new Error("expected a valid form");
    expect(JSON.parse(JSON.stringify(buildAddRelativeBody(checked.input)))).toEqual({
      project_id: 2,
      unit_id: 41,
      owner_id: 9,
      relative_name: "Mariam Al Rashidi",
      relative_id_number: "29801011234567",
      id_type: RELATIVE_ID_TYPE.nationalId,
      mobile_number: "01012345678",
      email: "mariam@example.com",
    });
  });
});
