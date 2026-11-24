import { describe, expect, it } from "vitest";
import { NEWS_MEDIA_MAX_FILES, type NewsArticle } from "@/src/services/newsShops";
import type { NewsFormValues } from "./types";
import {
  buildNewsChanges,
  buildNewsInput,
  checkNewsFile,
  emptyNewsForm,
  newsProjectChoices,
  newsToForm,
  validateNewsForm,
} from "./utils";

const article: NewsArticle = {
  id: 7,
  titleEn: "Pool",
  titleAr: "المسبح",
  contentEn: "Opens Monday.",
  contentAr: "يفتح الاثنين.",
  project: { id: 2, name: "Marina" },
  media: [
    { id: 3, type: "image", filePath: "https://cdn.test/a.jpg" },
    { id: 4, type: "video", filePath: "https://cdn.test/b.mp4" },
  ],
  published: false,
  publishedAt: null,
  createdAt: "2026-11-19T18:00:00+02:00",
};

const photo = new File(["x"], "pool.JPG");
const filled: NewsFormValues = { ...newsToForm(article), newMedia: [photo] };
const MB = 1024 * 1024;

describe("checkNewsFile", () => {
  it("takes the API's photo and video types, whatever the case", () => {
    for (const name of ["a.jpg", "a.JPEG", "a.png", "a.webp", "a.mp4", "a.MOV", "a.webm"]) {
      expect(checkNewsFile({ name, size: 10 })).toBeNull();
    }
    expect(checkNewsFile({ name: "a.pdf", size: 10 })).toEqual({ reason: "mediaType", name: "a.pdf" });
    expect(checkNewsFile({ name: "jpg", size: 10 })).toEqual({ reason: "mediaType", name: "jpg" });
  });

  it("holds photos to 5 MB and videos to 50 MB", () => {
    expect(checkNewsFile({ name: "a.png", size: 5 * MB })).toBeNull();
    expect(checkNewsFile({ name: "a.png", size: 5 * MB + 1 })).toEqual({ reason: "photoTooLarge", name: "a.png" });
    expect(checkNewsFile({ name: "a.mp4", size: 50 * MB })).toBeNull();
    expect(checkNewsFile({ name: "a.mp4", size: 50 * MB + 1 })).toEqual({ reason: "videoTooLarge", name: "a.mp4" });
  });
});

describe("validateNewsForm", () => {
  it("accepts a complete new article and an untouched edit", () => {
    expect(validateNewsForm(filled, null)).toEqual({});
    expect(validateNewsForm(newsToForm(article), article)).toEqual({});
  });

  it("names every required field of an empty new article", () => {
    expect(validateNewsForm(emptyNewsForm(), null)).toEqual({
      titleEn: "required",
      titleAr: "required",
      contentEn: "required",
      contentAr: "required",
      project: "required",
      media: { reason: "mediaRequired" },
    });
  });

  it("refuses text longer than the API takes", () => {
    const errors = validateNewsForm({ ...filled, titleEn: "x".repeat(256), contentAr: "x".repeat(20001) }, null);
    expect(errors).toEqual({ titleEn: "tooLong", contentAr: "tooLong" });
  });

  it("refuses removing the last photo or video, but lets an older article without any be saved", () => {
    const all = { ...newsToForm(article), removedMediaIds: [3, 4] };
    expect(validateNewsForm(all, article)).toEqual({ media: { reason: "mediaRequired" } });
    expect(validateNewsForm({ ...all, newMedia: [photo] }, article)).toEqual({});
    const bare = { ...article, media: [] };
    expect(validateNewsForm(newsToForm(bare), bare)).toEqual({});
  });

  it("counts the kept and the new files together against the limit", () => {
    const files = (count: number) => Array.from({ length: count }, (_, index) => new File(["x"], `${index}.png`));
    const room = NEWS_MEDIA_MAX_FILES - article.media.length;
    expect(validateNewsForm({ ...newsToForm(article), newMedia: files(room) }, article)).toEqual({});
    expect(validateNewsForm({ ...newsToForm(article), newMedia: files(room + 1) }, article)).toEqual({
      media: { reason: "tooMany" },
    });
    expect(
      validateNewsForm({ ...newsToForm(article), newMedia: files(room + 1), removedMediaIds: [3] }, article),
    ).toEqual({});
  });
});

describe("buildNewsInput", () => {
  it("turns the form into what the API saves", () => {
    expect(buildNewsInput({ ...filled, status: "published" })).toEqual({
      projectId: 2,
      titleEn: "Pool",
      titleAr: "المسبح",
      contentEn: "Opens Monday.",
      contentAr: "يفتح الاثنين.",
      published: true,
    });
  });
});

describe("buildNewsChanges", () => {
  it("is null when nothing changed, spaces around the text aside", () => {
    expect(buildNewsChanges(article, newsToForm(article))).toBeNull();
    expect(buildNewsChanges(article, { ...newsToForm(article), titleEn: " Pool " })).toBeNull();
  });

  it("holds only what changed", () => {
    expect(buildNewsChanges(article, { ...newsToForm(article), titleEn: "Pool reopening", status: "published" })).toEqual({
      titleEn: "Pool reopening",
      published: true,
      newMedia: [],
      removedMediaIds: [],
    });
  });

  it("saves added or removed files on their own", () => {
    expect(buildNewsChanges(article, { ...newsToForm(article), removedMediaIds: [3] })).toEqual({
      newMedia: [],
      removedMediaIds: [3],
    });
    expect(buildNewsChanges(article, filled)).toEqual({ newMedia: [photo], removedMediaIds: [] });
  });
});

describe("newsProjectChoices", () => {
  const own = [{ value: "2", label: "Marina" }];

  it("offers All Projects and the employee's projects", () => {
    expect(newsProjectChoices(own, "All Projects", null)).toEqual([{ value: "1", label: "All Projects" }, ...own]);
  });

  it("keeps the article's own project when the list doesn't offer it", () => {
    const elsewhere = { ...article, project: { id: 9, name: null } };
    expect(newsProjectChoices(own, "All Projects", elsewhere).at(-1)).toEqual({ value: "9", label: "#9" });
    expect(newsProjectChoices(own, "All Projects", article)).toHaveLength(2);
  });
});
