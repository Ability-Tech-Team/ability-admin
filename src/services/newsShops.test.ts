import { describe, expect, it, vi } from "vitest";
import { NewsAnswerError, fetchNews, newsDisplayDate, newsQuery, toNewsPage } from "./newsShops";

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
