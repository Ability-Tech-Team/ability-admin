import { describe, expect, it } from "vitest";
import type { Project } from "@/src/services/projects";
import {
  activeFromStatusFilter,
  emptyProjectForm,
  parseBoundaryPoint,
  projectToForm,
  validateProjectForm,
} from "./utils";

const project: Project = {
  id: 3,
  name: "Marina Heights",
  enName: "Marina Heights",
  arName: "مارينا هايتس",
  companyCode: "AMR",
  projectCode: "MH01",
  active: true,
  type: "COMMERCIAL",
  location: null,
  googleMapsLink: null,
  boundary: [
    { lat: 30.0444, lng: 31.2357 },
    { lat: 30.045, lng: 31.237 },
    { lat: 30.0435, lng: 31.2374 },
    { lat: 30.043, lng: 31.236 },
  ],
  managerName: null,
};

describe("activeFromStatusFilter", () => {
  it("filters by one ticked status and lists everything otherwise", () => {
    expect(activeFromStatusFilter(new Set())).toBeUndefined();
    expect(activeFromStatusFilter(new Set(["active", "inactive"]))).toBeUndefined();
    expect(activeFromStatusFilter(new Set(["active"]))).toBe(true);
    expect(activeFromStatusFilter(new Set(["inactive"]))).toBe(false);
  });
});

describe("parseBoundaryPoint", () => {
  it("reads 'lat, lng' and refuses anything off the map", () => {
    expect(parseBoundaryPoint(" 30.0444, 31.2357 ")).toEqual({ lat: 30.0444, lng: 31.2357 });
    expect(parseBoundaryPoint("30.0444 31.2357")).toEqual({ lat: 30.0444, lng: 31.2357 });
    expect(parseBoundaryPoint("91, 31")).toBeNull();
    expect(parseBoundaryPoint("30, 181")).toBeNull();
    expect(parseBoundaryPoint("30")).toBeNull();
    expect(parseBoundaryPoint("a, b")).toBeNull();
  });
});

describe("projectToForm", () => {
  it("fills the form from a project", () => {
    expect(projectToForm(project)).toEqual({
      enName: "Marina Heights",
      arName: "مارينا هايتس",
      companyCode: "AMR",
      projectCode: "MH01",
      type: "COMMERCIAL",
      location: "",
      googleMapsLink: "",
      managerName: "",
      boundary: ["30.0444, 31.2357", "30.045, 31.237", "30.0435, 31.2374", "30.043, 31.236"],
    });
  });

  it("leaves an unknown type unset", () => {
    expect(projectToForm({ ...project, type: "VILLA" }).type).toBe("");
  });
});

describe("validateProjectForm", () => {
  it("asks for the names and codes; the project code only when creating", () => {
    const create = validateProjectForm(emptyProjectForm(), "create");
    expect(create).toEqual({
      ok: false,
      errors: { enName: "required", arName: "required", companyCode: "required", projectCode: "required" },
    });
    const edit = validateProjectForm(emptyProjectForm(), "edit");
    expect(edit.ok).toBe(false);
    if (!edit.ok) expect(edit.errors.projectCode).toBeUndefined();
  });

  it("checks lengths and the map link", () => {
    const result = validateProjectForm(
      { ...projectToForm(project), companyCode: "ABCDEFGHIJK", googleMapsLink: "maps.google.com" },
      "edit",
    );
    expect(result).toEqual({ ok: false, errors: { companyCode: "tooLong", googleMapsLink: "invalidUrl" } });
  });

  it("needs all four corners once one is typed", () => {
    const values = { ...emptyProjectForm(), enName: "A", arName: "ب", companyCode: "C", projectCode: "P" };
    const result = validateProjectForm({ ...values, boundary: ["30, 31", "x", "", ""] }, "create");
    expect(result).toEqual({
      ok: false,
      errors: {
        boundary: "boundaryIncomplete",
        points: [undefined, "invalidPoint", "required", "required"],
      },
    });
  });

  it("builds the input, with no boundary when none is typed", () => {
    const values = { ...emptyProjectForm(), enName: "A", arName: "ب", companyCode: "C", projectCode: "P" };
    expect(validateProjectForm(values, "create")).toEqual({
      ok: true,
      input: {
        enName: "A",
        arName: "ب",
        companyCode: "C",
        projectCode: "P",
        type: null,
        location: "",
        googleMapsLink: "",
        managerName: "",
        boundary: null,
      },
    });
    const withBoundary = validateProjectForm(projectToForm(project), "edit");
    expect(withBoundary.ok && withBoundary.input.boundary).toEqual(project.boundary);
  });
});
