import { describe, expect, it, vi } from "vitest";
import {
  AboutUsAnswerError,
  buildAboutUsForm,
  fetchAboutUsContent,
  saveAboutUsContent,
  toAboutUsContent,
} from "./aboutUs";

function envelope(result: unknown) {
  return new Response(JSON.stringify({ result, success: true, statusCode: 200 }));
}

describe("toAboutUsContent", () => {
  it("reads the branding overview in both languages", () => {
    expect(
      toAboutUsContent({ id: 1, en_name: "Ability", ar_name: "أبيليتي", en_overview: "About", ar_overview: "عن" }),
    ).toEqual({ contentEn: "About", contentAr: "عن" });
  });

  it("reads no branding, or no overview yet, as empty text", () => {
    expect(toAboutUsContent(null)).toEqual({ contentEn: "", contentAr: "" });
    expect(toAboutUsContent({ id: 1, en_overview: null, ar_overview: null })).toEqual({ contentEn: "", contentAr: "" });
  });

  it("rejects an answer with the wrong shape", () => {
    expect(() => toAboutUsContent("nope")).toThrow(AboutUsAnswerError);
    expect(() => toAboutUsContent({ en_overview: 3 })).toThrow(AboutUsAnswerError);
  });
});

describe("buildAboutUsForm", () => {
  it("sends only the overview, trimmed", () => {
    const form = buildAboutUsForm({ contentEn: " About us ", contentAr: "عنا " });
    expect(Object.fromEntries(form.entries())).toEqual({ en_overview: "About us", ar_overview: "عنا" });
  });
});

describe("About Us calls", () => {
  it("loads GET /branding and saves with POST /branding", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(envelope({ en_overview: "Old", ar_overview: "قديم" }))
      .mockResolvedValueOnce(envelope({ en_overview: "New", ar_overview: "جديد" }));
    vi.stubGlobal("fetch", fetchImpl);
    try {
      expect(await fetchAboutUsContent("https://api.test/admin", "en")).toEqual({ contentEn: "Old", contentAr: "قديم" });
      expect(
        await saveAboutUsContent("https://api.test/admin", { contentEn: "New", contentAr: "جديد" }, "en"),
      ).toEqual({ contentEn: "New", contentAr: "جديد" });
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://api.test/admin/branding",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.test/admin/branding",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) }),
    );
  });
});
