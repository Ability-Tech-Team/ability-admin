import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GuidelinesAnswerError,
  buildGuidelineBody,
  buildGuidelineUpdateBody,
  createGuideline,
  deleteGuideline,
  fetchGuidelineStats,
  fetchGuidelines,
  guidelinesQuery,
  toGuideline,
  toGuidelinesPage,
  updateGuideline,
} from "./guidelines";

// Shaped like ContentService.formatGuideline / getGuidelines in
// ability-crm-api/apps/community-admin/src/content/content.service.ts.
const guideline = {
  id: 7,
  project: { id: 3, name: "Marina Heights" },
  en_title: "Pool Rules",
  ar_title: "قواعد المسبح",
  en_content: "No glass by the pool.",
  ar_content: "ممنوع الزجاج بجانب المسبح.",
  sort_order: 0,
  is_published: 1,
  published_at: "2026-11-20T10:00:00+02:00",
  created_at: "2026-11-19T09:00:00+02:00",
};

const adapted = {
  id: 7,
  projectId: 3,
  projectName: "Marina Heights",
  titleEn: "Pool Rules",
  titleAr: "قواعد المسبح",
  contentEn: "No glass by the pool.",
  contentAr: "ممنوع الزجاج بجانب المسبح.",
  sortOrder: 0,
  published: true,
  publishedAt: "2026-11-20T10:00:00+02:00",
  createdAt: "2026-11-19T09:00:00+02:00",
};

function envelope(result: unknown) {
  return new Response(JSON.stringify({ result, success: true, statusCode: 200 }));
}

function stubFetch(result: unknown) {
  const fetchImpl = vi.fn(async () => envelope(result));
  vi.stubGlobal("fetch", fetchImpl);
  return fetchImpl;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toGuideline", () => {
  it("adapts a guideline", () => {
    expect(toGuideline(guideline)).toEqual(adapted);
  });

  it("reads 0 as a draft and keeps a missing project name as null", () => {
    expect(
      toGuideline({ ...guideline, is_published: 0, published_at: null, project: { id: 1, name: null } }),
    ).toMatchObject({ published: false, publishedAt: null, projectId: 1, projectName: null });
  });

  it("rejects a guideline without its texts", () => {
    expect(() => toGuideline({ ...guideline, en_content: undefined })).toThrow(GuidelinesAnswerError);
  });
});

describe("toGuidelinesPage", () => {
  it("adapts the list and its counts", () => {
    expect(toGuidelinesPage({ total_count: 21, total_pages: 2, guidelines: [guideline] })).toEqual({
      totalCount: 21,
      totalPages: 2,
      guidelines: [adapted],
    });
  });

  it("rejects an answer without guidelines", () => {
    expect(() => toGuidelinesPage({ total_count: 0, total_pages: 0 })).toThrow(GuidelinesAnswerError);
  });
});

describe("guidelinesQuery", () => {
  it("sends the search, one project, the flag and the page", () => {
    expect(
      guidelinesQuery({ search: " pool ", projectId: 3, published: false, page: 2, limit: 20 }),
    ).toEqual({ search: "pool", project_id: 3, is_published: 0, page: 2, limit: 20 });
  });

  it("leaves out what isn't filtered", () => {
    expect(guidelinesQuery({ search: "", projectId: null, page: 1, limit: 20 })).toEqual({
      search: "",
      project_id: undefined,
      is_published: undefined,
      page: 1,
      limit: 20,
    });
  });
});

describe("fetchGuidelines", () => {
  it("calls GET /content/guidelines and drops empty values", async () => {
    const fetchImpl = stubFetch({ total_count: 0, total_pages: 0, guidelines: [] });
    await fetchGuidelines(
      "https://api.test/admin",
      { search: "", projectId: 1, page: 1, limit: 20 },
      "ar",
    );
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/content/guidelines?project_id=1&page=1&limit=20",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("fetchGuidelineStats", () => {
  it("counts the published and the drafts from the list's totals", async () => {
    const fetchImpl = vi.fn(async (url: string) =>
      envelope({
        total_count: url.includes("is_published=1") ? 4 : 2,
        total_pages: 1,
        guidelines: [],
      }),
    );
    vi.stubGlobal("fetch", fetchImpl);
    await expect(fetchGuidelineStats("https://api.test/admin", "en")).resolves.toEqual({
      published: 4,
      draft: 2,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/content/guidelines?is_published=0&page=1&limit=1",
      expect.anything(),
    );
  });
});

describe("request bodies", () => {
  const input = {
    projectId: 3,
    titleEn: " Pool Rules ",
    titleAr: "قواعد المسبح",
    contentEn: "No glass. ",
    contentAr: "ممنوع الزجاج.",
    published: true,
  };

  it("builds CreateGuidelineDto with trimmed text and the flag as 0/1", () => {
    expect(buildGuidelineBody(input)).toEqual({
      project_id: 3,
      en_title: "Pool Rules",
      ar_title: "قواعد المسبح",
      en_content: "No glass.",
      ar_content: "ممنوع الزجاج.",
      is_published: 1,
    });
  });

  it("sends only the given fields on update", () => {
    expect(buildGuidelineUpdateBody({ titleEn: " New ", published: false })).toEqual({
      en_title: "New",
      is_published: 0,
    });
  });
});

describe("saves", () => {
  it("POSTs JSON and resolves with the new id", async () => {
    const fetchImpl = stubFetch({ message: "Created", message_code: "GUIDELINE_CREATED_SUCCESSFULLY", id: 12 });
    const id = await createGuideline(
      "https://api.test/admin",
      { projectId: 1, titleEn: "A", titleAr: "ب", contentEn: "x", contentAr: "x", published: false },
      "en",
    );
    expect(id).toBe(12);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/content/guidelines",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          project_id: 1,
          en_title: "A",
          ar_title: "ب",
          en_content: "x",
          ar_content: "x",
          is_published: 0,
        }),
      }),
    );
  });

  it("rejects a create answer without an id", async () => {
    stubFetch({ message: "Created" });
    await expect(
      createGuideline(
        "https://api.test/admin",
        { projectId: 1, titleEn: "A", titleAr: "ب", contentEn: "x", contentAr: "x", published: false },
        "en",
      ),
    ).rejects.toThrow(GuidelinesAnswerError);
  });

  it("PUTs and DELETEs by id", async () => {
    const fetchImpl = stubFetch({ message: "Done" });
    await updateGuideline("https://api.test/admin", 7, { published: true }, "en");
    await deleteGuideline("https://api.test/admin", 7, "en");
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.test/admin/content/guidelines/7",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ is_published: 1 }) }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.test/admin/content/guidelines/7",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
