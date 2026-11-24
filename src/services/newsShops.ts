import { z } from "zod";
import { apiDelete, apiGet, apiPost, apiPut } from "@/src/lib/apiClient";

/**
 * News (`/admin/content/news`, ability-crm-api/apps/community-admin/src/content, answers built
 * by `formatNews` in content.service.ts). The list covers the projects the user can read plus
 * "All Projects". Each call resolves with the adapted answer or throws: `ApiError`
 * (src/lib/apiClient.ts) when the API refuses or can't be reached, `NewsAnswerError` when an
 * answer doesn't have the expected shape.
 *
 * The API has no shops. Saving takes form-data, because an article carries photos and videos.
 */

export class NewsAnswerError extends Error {
  constructor(route: string) {
    super(`The ${route} answer doesn't have the expected shape`);
    this.name = "NewsAnswerError";
  }
}

function parse<S extends z.ZodType>(schema: S, result: unknown, route: string): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success) throw new NewsAnswerError(route);
  return parsed.data;
}

/** A photo or video of the article (`formatGallery`); `type` is the API's media type. */
export type NewsMedia = { id: number; type: string; filePath: string };

export type NewsArticle = {
  id: number;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  /** `name` is in the request's language; null when the project has none in it. */
  project: { id: number; name: string | null };
  media: NewsMedia[];
  published: boolean;
  /** Local date-time (`2026-11-22T10:30:00+02:00`), null while a draft. */
  publishedAt: string | null;
  createdAt: string | null;
};

const newsSchema = z.object({
  id: z.number().int(),
  project: z.object({ id: z.number().int(), name: z.string().nullable() }),
  en_title: z.string(),
  ar_title: z.string(),
  en_content: z.string(),
  ar_content: z.string(),
  media: z.array(z.object({ id: z.number().int(), type: z.string(), file_path: z.string() })),
  is_published: z.union([z.literal(0), z.literal(1)]),
  published_at: z.string().nullable(),
  created_at: z.string().nullable(),
});

const listSchema = z.object({
  total_count: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
  news: z.array(newsSchema),
});

function toArticle(data: z.infer<typeof newsSchema>): NewsArticle {
  return {
    id: data.id,
    titleEn: data.en_title,
    titleAr: data.ar_title,
    contentEn: data.en_content,
    contentAr: data.ar_content,
    project: data.project,
    media: data.media.map((item) => ({ id: item.id, type: item.type, filePath: item.file_path })),
    published: data.is_published === 1,
    publishedAt: data.published_at,
    createdAt: data.created_at,
  };
}

export function toNewsArticle(result: unknown): NewsArticle {
  return toArticle(parse(newsSchema, result, "news article"));
}

export type NewsPage = { articles: NewsArticle[]; totalCount: number; totalPages: number };

export function toNewsPage(result: unknown): NewsPage {
  const data = parse(listSchema, result, "news");
  return {
    totalCount: data.total_count,
    totalPages: data.total_pages,
    articles: data.news.map(toArticle),
  };
}

/** The day the table shows: when it was published, else when it was written (`YYYY-MM-DD`). */
export function newsDisplayDate(article: Pick<NewsArticle, "publishedAt" | "createdAt">): string | null {
  const value = article.publishedAt ?? article.createdAt;
  return value ? value.slice(0, 10) : null;
}

// GET /content/news

/** `GetNewsDto`: the search matches the English or Arabic title or content. */
export type NewsFilter = {
  search: string;
  page: number;
  limit: number;
};

export function newsQuery({ search, page, limit }: NewsFilter) {
  return { search: search.trim(), page, limit };
}

export async function fetchNews(apiBaseUrl: string, filter: NewsFilter, locale: string): Promise<NewsPage> {
  const result = await apiGet(apiBaseUrl, "/content/news", newsQuery(filter), { locale });
  return toNewsPage(result);
}

/** GET /content/news/:id, with freshly signed links to its photos and videos. */
export async function fetchNewsArticle(apiBaseUrl: string, id: number, locale: string): Promise<NewsArticle> {
  return toNewsArticle(await apiGet(apiBaseUrl, `/content/news/${id}`, {}, { locale }));
}

// POST /content/news and PUT /content/news/:id (form-data, AttachmentsInterceptor(NEWS_MEDIA))

/** `projectEnums.ALL_PROJECTS`: news every project's app shows. Super Admin only for writes. */
export const ALL_PROJECTS_ID = 1;
/** `CreateNewsDto`. */
export const NEWS_TITLE_MAX = 255;
export const NEWS_CONTENT_MAX = 20000;
/** libs/core/src/media/gallery.ts. */
export const NEWS_MEDIA_MAX_FILES = 10;
export const NEWS_PHOTO_MAX_MB = 5;
export const NEWS_VIDEO_MAX_MB = 50;
export const NEWS_PHOTO_EXTENSIONS: readonly string[] = [".jpg", ".jpeg", ".png", ".webp"];
export const NEWS_VIDEO_EXTENSIONS: readonly string[] = [".mp4", ".mov", ".webm"];

/** What the article form saves. */
export type NewsInput = {
  projectId: number;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  published: boolean;
};

/** An edit: only what changed, the new files, and the saved photos or videos to remove. */
export type NewsChanges = Partial<NewsInput> & { newMedia: File[]; removedMediaIds: number[] };

function appendNewsFields(form: FormData, input: Partial<NewsInput>) {
  if (input.projectId !== undefined) form.append("project_id", String(input.projectId));
  if (input.titleEn !== undefined) form.append("en_title", input.titleEn.trim());
  if (input.titleAr !== undefined) form.append("ar_title", input.titleAr.trim());
  if (input.contentEn !== undefined) form.append("en_content", input.contentEn.trim());
  if (input.contentAr !== undefined) form.append("ar_content", input.contentAr.trim());
  if (input.published !== undefined) form.append("is_published", input.published ? "1" : "0");
}

/** `CreateNewsDto` with its files; the API needs at least one photo or video. */
export function buildCreateNewsForm(input: NewsInput, media: File[]): FormData {
  const form = new FormData();
  appendNewsFields(form, input);
  for (const file of media) form.append("media", file);
  return form;
}

/** `UpdateNewsDto`: every field optional; the removed files go as one "3,4" list. */
export function buildUpdateNewsForm({ newMedia, removedMediaIds, ...input }: NewsChanges): FormData {
  const form = new FormData();
  appendNewsFields(form, input);
  if (removedMediaIds.length > 0) form.append("deleted_media_ids", removedMediaIds.join(","));
  for (const file of newMedia) form.append("media", file);
  return form;
}

const createdSchema = z.object({ id: z.number().int() });

/** Resolves with the new article's id. 400 when a non-Super Admin picks "All Projects". */
export async function createNews(
  apiBaseUrl: string,
  input: NewsInput,
  media: File[],
  locale: string,
): Promise<number> {
  const result = await apiPost(apiBaseUrl, "/content/news", buildCreateNewsForm(input, media), { locale });
  return parse(createdSchema, result, "news (created)").id;
}

export async function updateNews(
  apiBaseUrl: string,
  id: number,
  changes: NewsChanges,
  locale: string,
): Promise<void> {
  await apiPut(apiBaseUrl, `/content/news/${id}`, buildUpdateNewsForm(changes), { locale });
}

/** DELETE /content/news/:id. The API marks it deleted; it can't be brought back from this app. */
export async function deleteNews(apiBaseUrl: string, id: number, locale: string): Promise<void> {
  await apiDelete(apiBaseUrl, `/content/news/${id}`, undefined, { locale });
}
