import { describe, expect, it, vi } from "vitest";
import {
  NewsAnswerError,
  buildCreateNewsForm,
  buildUpdateNewsForm,
  createNews,
  deleteNews,
  fetchNews,
  fetchNewsArticle,
  newsDisplayDate,
  newsQuery,
  toNewsPage,
  updateNews,
} from "./newsShops";

const row = {
  id: 7,
  project: { id: 1, name: "All Projects" },
  en_title: "Pool reopening",
  ar_title: "إعادة افتتاح المسبح",
  en_content: "The pool opens on Monday.",
  ar_content: "يفتح المسبح يوم الاثنين.",
  media: [{ id: 3, type: "IMAGE", file_path: "https://cdn.test/a.jpg" }],
  is_published: 1,
  published_at: "2026-11-20T09:15:00+02:00",
  created_at: "2026-11-19T18:00:00+02:00",
};

describe("toNewsPage", () => {
  it("adapts the list answer", () => {
    expect(toNewsPage({ total_count: 1, total_pages: 1, news: [row] })).toEqual({
      totalCount: 1,
      totalPages: 1,
      articles: [
        {
          id: 7,
          titleEn: "Pool reopening",
          titleAr: "إعادة افتتاح المسبح",
          contentEn: "The pool opens on Monday.",
          contentAr: "يفتح المسبح يوم الاثنين.",
          project: { id: 1, name: "All Projects" },
          media: [{ id: 3, type: "IMAGE", filePath: "https://cdn.test/a.jpg" }],
          published: true,
          publishedAt: "2026-11-20T09:15:00+02:00",
          createdAt: "2026-11-19T18:00:00+02:00",
        },
      ],
    });
  });

  it("reads a draft as not published", () => {
    const page = toNewsPage({ total_count: 1, total_pages: 1, news: [{ ...row, is_published: 0, published_at: null }] });
    expect(page.articles[0]).toMatchObject({ published: false, publishedAt: null });
  });

  it("rejects an answer without news, or with an unknown published flag", () => {
    expect(() => toNewsPage({ total_count: 0, total_pages: 0 })).toThrow(NewsAnswerError);
    expect(() => toNewsPage({ total_count: 1, total_pages: 1, news: [{ ...row, is_published: 2 }] })).toThrow(
      NewsAnswerError,
    );
  });
});

describe("newsDisplayDate", () => {
  it("shows the publishing day, else the day it was written", () => {
    expect(newsDisplayDate({ publishedAt: "2026-11-20T09:15:00+02:00", createdAt: "2026-11-19T18:00:00+02:00" })).toBe(
      "2026-11-20",
    );
    expect(newsDisplayDate({ publishedAt: null, createdAt: "2026-11-19T18:00:00+02:00" })).toBe("2026-11-19");
    expect(newsDisplayDate({ publishedAt: null, createdAt: null })).toBeNull();
  });
});

describe("fetchNews", () => {
  it("sends only GetNewsDto's parameters, trimmed", () => {
    expect(newsQuery({ search: "  pool ", page: 2, limit: 20 })).toEqual({ search: "pool", page: 2, limit: 20 });
  });

  it("calls GET /content/news and drops an empty search", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({ result: { total_count: 0, total_pages: 0, news: [] }, success: true, statusCode: 200 }),
      ),
    );
    vi.stubGlobal("fetch", fetchImpl);
    try {
      await fetchNews("https://api.test/admin", { search: " ", page: 1, limit: 20 }, "ar");
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/content/news?page=1&limit=20",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

const input = {
  projectId: 2,
  titleEn: " Pool ",
  titleAr: " المسبح ",
  contentEn: " Opens Monday. ",
  contentAr: " يفتح الاثنين. ",
  published: true,
};
const photo = new File(["x"], "pool.jpg", { type: "image/jpeg" });
const clip = new File(["y"], "pool.mp4", { type: "video/mp4" });

/** FormData's text fields and file names, in order. */
function entriesOf(form: FormData) {
  return [...form.entries()].map(([key, value]) => [key, value instanceof File ? value.name : value]);
}

describe("buildCreateNewsForm", () => {
  it("sends the DTO's fields trimmed, and each file as media", () => {
    expect(entriesOf(buildCreateNewsForm(input, [photo, clip]))).toEqual([
      ["project_id", "2"],
      ["en_title", "Pool"],
      ["ar_title", "المسبح"],
      ["en_content", "Opens Monday."],
      ["ar_content", "يفتح الاثنين."],
      ["is_published", "1"],
      ["media", "pool.jpg"],
      ["media", "pool.mp4"],
    ]);
  });
});

describe("buildUpdateNewsForm", () => {
  it("sends only what changed, with the removed files as one list", () => {
    expect(entriesOf(buildUpdateNewsForm({ published: false, newMedia: [clip], removedMediaIds: [3, 4] }))).toEqual([
      ["is_published", "0"],
      ["deleted_media_ids", "3,4"],
      ["media", "pool.mp4"],
    ]);
    expect(entriesOf(buildUpdateNewsForm({ titleEn: "New", newMedia: [], removedMediaIds: [] }))).toEqual([["en_title", "New"]]);
  });
});

describe("saving and loading one article", () => {
  function stub(result: unknown) {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ result, success: true, statusCode: 200 }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchImpl);
    return fetchImpl;
  }

  it("posts a new article as form-data and resolves with its id", async () => {
    const fetchImpl = stub({ message_code: "NEWS_CREATED_SUCCESSFULLY", id: 12 });
    try {
      await expect(createNews("https://api.test/admin", input, [photo], "en")).resolves.toBe(12);
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/content/news",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) }),
    );
  });

  it("rejects a create answer without an id", async () => {
    stub({ message_code: "NEWS_CREATED_SUCCESSFULLY" });
    try {
      await expect(createNews("https://api.test/admin", input, [photo], "en")).rejects.toThrow(NewsAnswerError);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("puts an edit to the article's route as form-data", async () => {
    const fetchImpl = stub({ message_code: "NEWS_UPDATED_SUCCESSFULLY" });
    try {
      await updateNews("https://api.test/admin", 7, { titleEn: "New", newMedia: [], removedMediaIds: [] }, "en");
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/admin/content/news/7",
      expect.objectContaining({ method: "PUT", body: expect.any(FormData) }),
    );
  });

  it("deletes an article", async () => {
    const fetchImpl = stub({ message_code: "NEWS_DELETED_SUCCESSFULLY" });
    try {
      await deleteNews("https://api.test/admin", 7, "en");
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenCalledWith("https://api.test/admin/content/news/7", expect.objectContaining({ method: "DELETE" }));
  });

  it("loads one article", async () => {
    const fetchImpl = stub(row);
    try {
      await expect(fetchNewsArticle("https://api.test/admin", 7, "en")).resolves.toMatchObject({ id: 7, titleEn: "Pool reopening" });
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenCalledWith("https://api.test/admin/content/news/7", expect.objectContaining({ method: "GET" }));
  });
});
