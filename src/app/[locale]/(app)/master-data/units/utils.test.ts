import { describe, expect, it } from "vitest";
import { activeFromStatusFilter, addUnitProjectChoice, emptyUnitForm, ownerColor, validateUnitForm } from "./utils";

describe("activeFromStatusFilter", () => {
  it("filters only when one of the two statuses is ticked", () => {
    expect(activeFromStatusFilter(new Set())).toBeUndefined();
    expect(activeFromStatusFilter(new Set(["active", "inactive"]))).toBeUndefined();
    expect(activeFromStatusFilter(new Set(["active"]))).toBe(true);
    expect(activeFromStatusFilter(new Set(["inactive"]))).toBe(false);
  });
});

describe("ownerColor", () => {
  it("gives a customer the same colour every time", () => {
    expect(ownerColor(9)).toBe(ownerColor(9));
    expect(ownerColor(9)).toMatch(/^bg-/);
  });
});

describe("validateUnitForm", () => {
  const filled = {
    ...emptyUnitForm("2"),
    unitNumber: " A-301 ",
    unitTypeId: "4",
    locationId: "7",
    totalArea: "120.5",
  };

  it("names every missing required field", () => {
    expect(validateUnitForm(emptyUnitForm())).toEqual({
      ok: false,
      errors: {
        projectId: "required",
        unitNumber: "required",
        unitTypeId: "required",
        locationId: "required",
        totalArea: "required",
      },
    });
    expect(validateUnitForm({ ...filled, unitNumber: "   " })).toEqual({ ok: false, errors: { unitNumber: "required" } });
  });

  it("wants an area above 0 and a whole floor", () => {
    expect(validateUnitForm({ ...filled, totalArea: "0" })).toEqual({ ok: false, errors: { totalArea: "area" } });
    expect(validateUnitForm({ ...filled, totalArea: "12a" })).toEqual({ ok: false, errors: { totalArea: "area" } });
    expect(validateUnitForm({ ...filled, floor: "2.5" })).toEqual({ ok: false, errors: { floor: "floor" } });
  });

  it("gives the unit to save, without a building or floor when none was given", () => {
    expect(validateUnitForm(filled)).toEqual({
      ok: true,
      input: {
        projectId: 2,
        subProjectId: null,
        unitNumber: "A-301",
        unitTypeId: 4,
        locationId: 7,
        totalArea: 120.5,
        floor: null,
      },
    });
    const withBoth = validateUnitForm({ ...filled, subProjectId: "3", floor: "-1" });
    expect(withBoth.ok && withBoth.input).toMatchObject({ subProjectId: 3, floor: -1 });
  });
});

describe("addUnitProjectChoice", () => {
  const projects = [
    { id: 2, name: "Marina Heights", active: true },
    { id: 5, name: "Old Town", active: false },
  ];
  const session = { id: 9, name: "My Project" };

  it("lets the Super Admin pick an active project, starting on the list's filter", () => {
    expect(addUnitProjectChoice({ data: projects, failure: null }, session, 2)).toEqual({
      projects: { options: [{ id: 2, name: "Marina Heights" }], locked: false, unavailable: false },
      initialProjectId: "2",
    });
    // An inactive project, or none, as the filter starts without a choice.
    expect(addUnitProjectChoice({ data: projects, failure: null }, session, 5).initialProjectId).toBe("");
    expect(addUnitProjectChoice({ data: projects, failure: null }, session, undefined).initialProjectId).toBe("");
  });

  it("saves anyone else to the sign-in project", () => {
    expect(addUnitProjectChoice({ data: null, failure: { reason: "forbidden" } }, session, undefined)).toEqual({
      projects: { options: [{ id: 9, name: "My Project" }], locked: true, unavailable: false },
      initialProjectId: "9",
    });
    expect(
      addUnitProjectChoice({ data: null, failure: { reason: "forbidden" } }, { id: 9, name: null }, undefined).projects.options,
    ).toEqual([{ id: 9, name: "#9" }]);
    expect(addUnitProjectChoice({ data: null, failure: { reason: "forbidden" } }, null, undefined)).toEqual({
      projects: { options: null, locked: true, unavailable: true },
      initialProjectId: "",
    });
  });

  it("offers nothing while loading, and says so when the list failed", () => {
    expect(addUnitProjectChoice({ data: null, failure: null }, session, 2).projects).toEqual({
      options: null,
      locked: false,
      unavailable: false,
    });
    expect(addUnitProjectChoice({ data: null, failure: { reason: "unreachable" } }, session, 2).projects.unavailable).toBe(true);
  });
});
