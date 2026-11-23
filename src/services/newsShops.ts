import { z } from "zod";
import { apiGet } from "@/src/lib/apiClient";

/**
 * News (`/admin/content/news`, ability-crm-api/apps/community-admin/src/content, answers built
 * by `formatNews` in content.service.ts). The list covers the projects the user can read plus
 * "All Projects". Each call resolves with the adapted answer or throws: `ApiError`
 * (src/lib/apiClient.ts) when the API refuses or can't be reached, `NewsAnswerError` when an
 * answer doesn't have the expected shape.
 *
 * The API has no shops and no news categories; the screen's Category column stays empty.
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
