import { z } from "zod";
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/apiClient";

/**
 * Community guidelines (`/admin/content/guidelines`,
 * ability-crm-api/apps/community-admin/src/content, answers built by `ContentService` there).
 * Requests are JSON; there is no file. Each call resolves with the adapted answer or throws:
 * `ApiError` (src/lib/apiClient.ts) when the API refuses or can't be reached,
 * `GuidelinesAnswerError` when an answer doesn't have the expected shape.
 *
 * A guideline has an English and an Arabic title and text, a project (or "All Projects", which
 * only the Super Admin can write to), a sort order and a published flag. It has no category,
 * summary, PDF, sections or update time on the API.
 */

export class GuidelinesAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "GuidelinesAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new GuidelinesAnswerError(route);
  return parsed.data;
}

/** `projectEnums.ALL_PROJECTS`: content every project's app shows. Super Admin only for writes. */
export const ALL_PROJECTS_ID = 1;

/** `CreateGuidelineDto` limits. */
export const GUIDELINE_TITLE_MAX = 255;
export const GUIDELINE_CONTENT_MAX = 20000;

export type Guideline = {
  id: number;
  projectId: number;
  /** In the request's language; null when the project has no name in it. */
  projectName: string | null;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  sortOrder: number;
  published: boolean;
  /** As the API formats it; null while a draft. */
  publishedAt: string | null;
  createdAt: string | null;
};

export type GuidelinesPage = { guidelines: Guideline[]; totalCount: number; totalPages: number };

const guidelineSchema = z.object({
  id: z.number().int(),
  project: z.object({ id: z.number().int(), name: z.string().nullable().optional() }),
  en_title: z.string(),
  ar_title: z.string(),
  en_content: z.string(),
  ar_content: z.string(),
  sort_order: z.number().int(),
  is_published: z.number().int(),
  published_at: z.string().nullable(),
  created_at: z.string().nullable(),
});

const listSchema = z.object({
  total_count: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
  guidelines: z.array(guidelineSchema),
});

function toGuidelineFields(data: z.infer<typeof guidelineSchema>): Guideline {
  return {
    id: data.id,
    projectId: data.project.id,
    projectName: data.project.name ?? null,
    titleEn: data.en_title,
    titleAr: data.ar_title,
    contentEn: data.en_content,
    contentAr: data.ar_content,
    sortOrder: data.sort_order,
    published: data.is_published === 1,
    publishedAt: data.published_at,
    createdAt: data.created_at,
  };
}

export function toGuideline(result: unknown): Guideline {
  return toGuidelineFields(parse(guidelineSchema, result, "guideline"));
}

export function toGuidelinesPage(result: unknown): GuidelinesPage {
  const data = parse(listSchema, result, "guidelines");
  return {
    totalCount: data.total_count,
    totalPages: data.total_pages,
    guidelines: data.guidelines.map(toGuidelineFields),
  };
}

// GET /content/guidelines

/** `GetContentItemsDto`: the search matches the English or Arabic title. */
export type GuidelinesFilter = {
  search: string;
  /** One project, or `ALL_PROJECTS_ID` for the content shown everywhere; null for every project. */
  projectId: number | null;
  /** Undefined lists both. */
  published?: boolean;
  page: number;
  limit: number;
};

export function guidelinesQuery({ search, projectId, published, page, limit }: GuidelinesFilter) {
  return {
    search: search.trim(),
    project_id: projectId ?? undefined,
    is_published: published === undefined ? undefined : published ? 1 : 0,
    page,
    limit,
  };
}

export async function fetchGuidelines(
  apiBaseUrl: string,
  filter: GuidelinesFilter,
  locale: string,
): Promise<GuidelinesPage> {
  const result = await apiGet(apiBaseUrl, "/content/guidelines", guidelinesQuery(filter), { locale });
  return toGuidelinesPage(result);
}

export type GuidelineStats = { published: number; draft: number };

/** The published and draft counts: the list's `total_count` with each flag, one row asked for. */
export async function fetchGuidelineStats(apiBaseUrl: string, locale: string): Promise<GuidelineStats> {
  const count = (published: boolean) =>
    fetchGuidelines(apiBaseUrl, { search: "", projectId: null, published, page: 1, limit: 1 }, locale);
  const [published, draft] = await Promise.all([count(true), count(false)]);
  return { published: published.totalCount, draft: draft.totalCount };
}

export async function fetchGuideline(apiBaseUrl: string, id: number, locale: string): Promise<Guideline> {
  return toGuideline(await apiGet(apiBaseUrl, `/content/guidelines/${id}`, {}, { locale }));
}

// POST /content/guidelines, PUT and DELETE /content/guidelines/:id

/** What the guideline form saves. */
export type GuidelineInput = {
  projectId: number;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  published: boolean;
};

/** `CreateGuidelineDto`. The sort order is left to the API (0). */
export function buildGuidelineBody(input: GuidelineInput) {
  return {
    project_id: input.projectId,
    en_title: input.titleEn.trim(),
    ar_title: input.titleAr.trim(),
    en_content: input.contentEn.trim(),
    ar_content: input.contentAr.trim(),
    is_published: input.published ? 1 : 0,
  };
}

/** `UpdateGuidelineDto` (every field optional): only what is given is sent. */
export function buildGuidelineUpdateBody(input: Partial<GuidelineInput>) {
  return {
    ...(input.projectId !== undefined && { project_id: input.projectId }),
    ...(input.titleEn !== undefined && { en_title: input.titleEn.trim() }),
    ...(input.titleAr !== undefined && { ar_title: input.titleAr.trim() }),
    ...(input.contentEn !== undefined && { en_content: input.contentEn.trim() }),
    ...(input.contentAr !== undefined && { ar_content: input.contentAr.trim() }),
    ...(input.published !== undefined && { is_published: input.published ? 1 : 0 }),
  };
}

const createdSchema = z.object({ id: z.number().int() });

/** Resolves with the new guideline's id. 400 when a non-Super Admin picks "All Projects". */
export async function createGuideline(
  apiBaseUrl: string,
  input: GuidelineInput,
  locale: string,
): Promise<number> {
  const result = await apiPost(apiBaseUrl, "/content/guidelines", buildGuidelineBody(input), { locale });
  return parse(createdSchema, result, "guideline (created)").id;
}

export async function updateGuideline(
  apiBaseUrl: string,
  id: number,
  input: Partial<GuidelineInput>,
  locale: string,
): Promise<void> {
  await apiPut(apiBaseUrl, `/content/guidelines/${id}`, buildGuidelineUpdateBody(input), { locale });
}

/** The API marks it deleted; it can't be brought back from this app. */
export async function deleteGuideline(apiBaseUrl: string, id: number, locale: string): Promise<void> {
  await apiDelete(apiBaseUrl, `/content/guidelines/${id}`, undefined, { locale });
}
