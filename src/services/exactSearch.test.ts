import { describe, expect, it } from "vitest";
import { projectsQuery } from "./projects";
import { unitAssignmentsQuery } from "./unitAssignments";

// `is_exact` (0 or 1 in GetCompanyProjectsDto and GetUnitAssignmentsDto) goes only with a search.

describe("exact search", () => {
  it("sends is_exact=1 with a search when asked", () => {
    expect(projectsQuery({ search: " Marina ", exact: true, page: 1, limit: 20 })).toMatchObject({
      search: "Marina",
      is_exact: 1,
    });
    expect(unitAssignmentsQuery({ search: "B-204", exact: true, page: 1, limit: 20 })).toMatchObject({
      search: "B-204",
      is_exact: 1,
    });
  });

  it("leaves is_exact out without a search, or when not asked", () => {
    expect(projectsQuery({ search: "  ", exact: true, page: 1, limit: 20 }).is_exact).toBeUndefined();
    expect(unitAssignmentsQuery({ search: "B-204", page: 1, limit: 20 }).is_exact).toBeUndefined();
  });
});
