import { describe, expect, it, vi } from "vitest";
import {
  ProjectsAnswerError,
  buildCreateProjectForm,
  buildProjectStatusForm,
  buildUpdateProjectForm,
  fetchProjectOptions,
  fetchProjects,
  projectsQuery,
  toProject,
  toProjectOptions,
  toProjectsPage,
  type ProjectInput,
} from "./projects";

describe("toProjectOptions", () => {
  it("names each project in the request's language, else in English, and keeps it lenient", () => {
    expect(
      toProjectOptions([
        { id: 2, name: "مارينا", en_name: "Marina", ar_name: "مارينا", is_active: 1 },
        // No Arabic name and no request-language name: still listed, in English.
        { id: 3, name: null, en_name: "Palm", ar_name: null, is_active: 0 },
        { id: 4, en_name: "Gouna", is_active: 1 },
      ]),
    ).toEqual([
      { id: 2, name: "مارينا", active: true },
      { id: 3, name: "Palm", active: false },
      { id: 4, name: "Gouna", active: true },
    ]);
  });

  it("rejects an answer that isn't a list of projects", () => {
    expect(() => toProjectOptions({ total_count: 0 })).toThrow(ProjectsAnswerError);
  });
});

describe("fetchProjectOptions", () => {
  const answer = [
    { id: 2, name: "Marina", en_name: "Marina", ar_name: "مارينا", is_active: 1 },
    { id: 3, name: "Palm", en_name: "Palm", ar_name: "بالم", is_active: 0 },
  ];

  it("asks for the employee's projects and keeps only the active ones when asked", async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ result: answer, success: true, statusCode: 200 }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchImpl);
    let active: Awaited<ReturnType<typeof fetchProjectOptions>> = [];
    let all: typeof active = [];
    try {
      active = await fetchProjectOptions("https://api.test/admin", { activeOnly: true }, "en");
      all = await fetchProjectOptions("https://api.test/admin", { activeOnly: false }, "en");
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenCalledWith("https://api.test/admin/projects/accessible", expect.objectContaining({ method: "GET" }));
    expect(active.map((project) => project.id)).toEqual([2]);
    expect(all.map((project) => project.id)).toEqual([2, 3]);
  });
});

// Answers shaped like CompanyProjectsService.formatProject / getProjects in
// ability-crm-api/libs/domain/src/company-projects/company-projects.service.ts.

const boundary = [
  { lat: 30.0444, lng: 31.2357 },
  { lat: 30.045, lng: 31.237 },
  { lat: 30.0435, lng: 31.2374 },
  { lat: 30.043, lng: 31.236 },
];

const project = {
  id: 3,
  name: "Marina Heights",
  en_name: "Marina Heights",
  ar_name: "مارينا هايتس",
  company_code: "AMR",
  project_code: "MH01",
  is_active: 1,
  type: "RESIDENTIAL",
  location: "Dubai Marina",
  google_maps_link: "https://maps.google.com/?q=1",
  boundary,
  manager_name: "Faisal",
  profile: {
    cover_image: { file_path: "https://bucket.s3.amazonaws.com/x.jpg?X-Amz-Signature=1" },
    en_description: null,
    ar_description: null,
    master_plan_image: null,
    website_url: null,
    brochure: null,
    is_published: 0,
  },
  amenities: [{ id: 1, icon: "POOL", name: "Pool", en_name: "Pool", ar_name: "مسبح" }],
  media: [{ id: 9, type: "IMAGE", file_path: "https://bucket.s3.amazonaws.com/y.jpg" }],
  created_at: "2026-11-01, 10:00",
  updated_at: null,
};

const adapted = {
  id: 3,
  name: "Marina Heights",
  enName: "Marina Heights",
  arName: "مارينا هايتس",
  companyCode: "AMR",
  projectCode: "MH01",
  active: true,
  type: "RESIDENTIAL",
  location: "Dubai Marina",
  googleMapsLink: "https://maps.google.com/?q=1",
  boundary,
  managerName: "Faisal",
};

describe("toProject", () => {
  it("adapts a project and leaves out what the screen doesn't use", () => {
    expect(toProject(project)).toEqual(adapted);
  });

  it("keeps empty optional fields as null and reads 0 as inactive", () => {
    const bare = {
      ...project,
      is_active: 0,
      type: null,
      location: null,
      google_maps_link: null,
      boundary: null,
      manager_name: null,
      profile: null,
    };
    expect(toProject(bare)).toMatchObject({
      active: false,
      type: null,
      location: null,
      googleMapsLink: null,
      boundary: null,
      managerName: null,
    });
  });

  it("falls back to the English name when the answer has no localized one", () => {
    const withoutName: Record<string, unknown> = { ...project, name: undefined };
    delete withoutName.name;
    expect(toProject(withoutName).name).toBe("Marina Heights");
  });

  it("rejects a malformed boundary instead of drawing it", () => {
    expect(() => toProject({ ...project, boundary: [{ lat: "30", lng: 31 }] })).toThrow(
      ProjectsAnswerError,
    );
  });
});

describe("toProjectsPage", () => {
  it("adapts the page, its totals and each project's units and occupancy", () => {
    const answer = {
      total_count: 41,
      total_pages: 3,
      projects: [{ ...project, total_units: 320, occupancy: 89.06 }],
    };
    expect(toProjectsPage(answer)).toEqual({
      totalCount: 41,
      totalPages: 3,
      projects: [{ ...adapted, totalUnits: 320, occupancy: 89.06 }],
    });
  });

  it("rejects a page without its totals", () => {
    expect(() => toProjectsPage({ projects: [] })).toThrow(ProjectsAnswerError);
  });
});

describe("projectsQuery", () => {
  it("sends only the DTO's params, with is_active as 1 or 0", () => {
    expect(projectsQuery({ search: " palm ", active: false, page: 2, limit: 20 })).toEqual({
      search: "palm",
      is_active: 0,
      page: 2,
      limit: 20,
    });
    expect(projectsQuery({ search: "", page: 1, limit: 20 }).is_active).toBeUndefined();
  });

  it("calls GET /projects and drops empty values", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          result: { total_count: 0, total_pages: 0, projects: [] },
          success: true,
          statusCode: 200,
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchImpl);
    try {
      await fetchProjects("https://api.test/admin", { search: "", active: true, page: 1, limit: 20 }, "ar");
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/projects?is_active=1&page=1&limit=20",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

const input: ProjectInput = {
  enName: " Sunset Towers ",
  arName: "أبراج الغروب",
  companyCode: "AMR",
  type: "MIXED",
  location: "",
  googleMapsLink: "",
  managerName: " Layla ",
  boundary,
};

describe("buildCreateProjectForm", () => {
  it("sends the required fields, the boundary as JSON, and leaves empty ones out", () => {
    const form = buildCreateProjectForm({ ...input, projectCode: " ST01 " });
    expect(Object.fromEntries(form.entries())).toEqual({
      en_name: "Sunset Towers",
      ar_name: "أبراج الغروب",
      company_code: "AMR",
      project_code: "ST01",
      type: "MIXED",
      manager_name: "Layla",
      boundary: JSON.stringify(boundary),
    });
  });

  it("leaves out an unset type and boundary", () => {
    const form = buildCreateProjectForm({ ...input, type: null, boundary: null, projectCode: "X" });
    expect(form.has("type")).toBe(false);
    expect(form.has("boundary")).toBe(false);
  });
});

describe("buildUpdateProjectForm", () => {
  it("never sends project_code, and sends cleared fields so they clear", () => {
    const form = buildUpdateProjectForm({ ...input, boundary: null });
    expect(Object.fromEntries(form.entries())).toEqual({
      en_name: "Sunset Towers",
      ar_name: "أبراج الغروب",
      company_code: "AMR",
      type: "MIXED",
      location: "",
      google_maps_link: "",
      manager_name: "Layla",
      boundary: "null",
    });
  });

  it("can't clear the type, so an unset one is left out", () => {
    expect(buildUpdateProjectForm({ ...input, type: null }).has("type")).toBe(false);
  });
});

describe("buildProjectStatusForm", () => {
  it("sends is_active alone", () => {
    expect(Object.fromEntries(buildProjectStatusForm(false).entries())).toEqual({ is_active: "0" });
    expect(Object.fromEntries(buildProjectStatusForm(true).entries())).toEqual({ is_active: "1" });
  });
});
