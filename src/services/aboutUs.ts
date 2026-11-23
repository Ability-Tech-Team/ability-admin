import { z } from "zod";
import { apiGet, apiPost } from "@/src/lib/apiClient";

/**
 * About Us: the client's branding overview (`en_overview` / `ar_overview`), which the mobile
 * app shows on its About Us page (`/app/content/about-us`). The admin API reads and writes it
 * through `/admin/branding` (ability-crm-api/libs/core/src/branding): GET is open to anyone,
 * POST is Super Admin only (403 for other roles). Each call resolves with the adapted answer or
 * throws: `ApiError` when the API refuses or can't be reached, `AboutUsAnswerError` when an
 * answer doesn't have the expected shape.
 */

export class AboutUsAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "AboutUsAnswerError";
  }
}

export type AboutUsContent = {
  contentEn: string;
  contentAr: string;
};

// The whole branding row comes back; only the overview belongs to this screen.
const brandingSchema = z.object({
  en_overview: z.string().nullable().optional(),
  ar_overview: z.string().nullable().optional(),
});

/** The branding answer; `null` (no branding saved yet) is an empty About Us. */
export function toAboutUsContent(result: unknown, route = "branding"): AboutUsContent {
  if (result === null) return { contentEn: "", contentAr: "" };
  const parsed = brandingSchema.safeParse(result);
  if (!parsed.success) throw new AboutUsAnswerError(route);
  return {
    contentEn: parsed.data.en_overview ?? "",
    contentAr: parsed.data.ar_overview ?? "",
  };
}

// GET /branding

export async function fetchAboutUsContent(apiBaseUrl: string, locale: string): Promise<AboutUsContent> {
  const result = await apiGet(apiBaseUrl, "/branding", {}, { locale });
  return toAboutUsContent(result);
}

// POST /branding

/**
 * `UpdateBrandingDto`, multipart like the route (it also takes the logo and About image). Only
 * the overview is sent, so the other branding fields keep their values.
 */
export function buildAboutUsForm({ contentEn, contentAr }: AboutUsContent): FormData {
  const form = new FormData();
  form.append("en_overview", contentEn.trim());
  form.append("ar_overview", contentAr.trim());
  return form;
}

export async function saveAboutUsContent(
  apiBaseUrl: string,
  content: AboutUsContent,
  locale: string,
): Promise<AboutUsContent> {
  const result = await apiPost(apiBaseUrl, "/branding", buildAboutUsForm(content), { locale });
  return toAboutUsContent(result, "branding (save)");
}
