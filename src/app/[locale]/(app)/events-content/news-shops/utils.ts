import {
  ALL_PROJECTS_ID,
  NEWS_CONTENT_MAX,
  NEWS_MEDIA_MAX_FILES,
  NEWS_PHOTO_EXTENSIONS,
  NEWS_PHOTO_MAX_MB,
  NEWS_TITLE_MAX,
  NEWS_VIDEO_EXTENSIONS,
  NEWS_VIDEO_MAX_MB,
  type NewsArticle,
  type NewsChanges,
  type NewsInput,
  type NewsMedia,
} from "@/src/services/newsShops";
import type { NewsFormErrors, NewsFormValues, NewsMediaError, ProjectChoice } from "./types";

const MB = 1024 * 1024;

export function emptyNewsForm(): NewsFormValues {
  return {
    titleEn: "",
    titleAr: "",
    contentEn: "",
    contentAr: "",
    project: "",
    status: "draft",
    newMedia: [],
    removedMediaIds: [],
  };
}

export function newsToForm(article: NewsArticle): NewsFormValues {
  return {
    titleEn: article.titleEn,
    titleAr: article.titleAr,
    contentEn: article.contentEn,
    contentAr: article.contentAr,
    project: String(article.project.id),
    status: article.published ? "published" : "draft",
    newMedia: [],
    removedMediaIds: [],
  };
}

/**
 * The form's projects: "All Projects", the employee's own, and the article's when the list
 * doesn't offer it (an inactive one, say). Only the Super Admin may save to "All Projects"; the
 * API refuses it for anyone else.
 */
export function newsProjectChoices(
  choices: ProjectChoice[],
  allProjectsLabel: string,
  article: NewsArticle | null,
): ProjectChoice[] {
  const all = [{ value: String(ALL_PROJECTS_ID), label: allProjectsLabel }, ...choices];
  if (!article || all.some((choice) => choice.value === String(article.project.id))) return all;
  return [...all, { value: String(article.project.id), label: article.project.name ?? `#${article.project.id}` }];
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

/** Why one file can't be uploaded, by the API's rules (libs/core/src/media/gallery.ts). */
export function checkNewsFile(file: Pick<File, "name" | "size">): NewsMediaError | null {
  const extension = extensionOf(file.name);
  if (NEWS_PHOTO_EXTENSIONS.includes(extension)) {
    return file.size > NEWS_PHOTO_MAX_MB * MB ? { reason: "photoTooLarge", name: file.name } : null;
  }
  if (NEWS_VIDEO_EXTENSIONS.includes(extension)) {
    return file.size > NEWS_VIDEO_MAX_MB * MB ? { reason: "videoTooLarge", name: file.name } : null;
  }
  return { reason: "mediaType", name: file.name };
}

export function keptMedia(article: NewsArticle | null, removedMediaIds: number[]): NewsMedia[] {
  return article ? article.media.filter((item) => !removedMediaIds.includes(item.id)) : [];
}

function checkNewsMedia(values: NewsFormValues, article: NewsArticle | null): NewsMediaError | null {
  for (const file of values.newMedia) {
    const problem = checkNewsFile(file);
    if (problem) return problem;
  }
  const count = keptMedia(article, values.removedMediaIds).length + values.newMedia.length;
  if (count > NEWS_MEDIA_MAX_FILES) return { reason: "tooMany" };
  // An older article saved without any may stay so; the API only refuses removing the last one.
  if (count === 0 && (!article || article.media.length > 0)) return { reason: "mediaRequired" };
  return null;
}

/** `article` is the one being edited, or null for a new one. */
export function validateNewsForm(values: NewsFormValues, article: NewsArticle | null): NewsFormErrors {
  const errors: NewsFormErrors = {};
  const check = (field: "titleEn" | "titleAr" | "contentEn" | "contentAr", max: number) => {
    const value = values[field].trim();
    if (!value) errors[field] = "required";
    else if (value.length > max) errors[field] = "tooLong";
  };
  check("titleEn", NEWS_TITLE_MAX);
  check("titleAr", NEWS_TITLE_MAX);
  check("contentEn", NEWS_CONTENT_MAX);
  check("contentAr", NEWS_CONTENT_MAX);
  if (!values.project) errors.project = "required";
  const media = checkNewsMedia(values, article);
  if (media) errors.media = media;
  return errors;
}

/** Call it once `validateNewsForm` finds nothing. */
export function buildNewsInput(values: NewsFormValues): NewsInput {
  return {
    projectId: Number(values.project),
    titleEn: values.titleEn,
    titleAr: values.titleAr,
    contentEn: values.contentEn,
    contentAr: values.contentAr,
    published: values.status === "published",
  };
}

/** Only what changed, so an unchanged article isn't written again; null when nothing did. */
export function buildNewsChanges(article: NewsArticle, values: NewsFormValues): NewsChanges | null {
  const input = buildNewsInput(values);
  const changes: NewsChanges = {
    ...(input.projectId !== article.project.id && { projectId: input.projectId }),
    ...(input.titleEn.trim() !== article.titleEn && { titleEn: input.titleEn }),
    ...(input.titleAr.trim() !== article.titleAr && { titleAr: input.titleAr }),
    ...(input.contentEn.trim() !== article.contentEn && { contentEn: input.contentEn }),
    ...(input.contentAr.trim() !== article.contentAr && { contentAr: input.contentAr }),
    ...(input.published !== article.published && { published: input.published }),
    newMedia: values.newMedia,
    removedMediaIds: values.removedMediaIds,
  };
  const onlyMedia = Object.keys(changes).length === 2;
  return onlyMedia && values.newMedia.length === 0 && values.removedMediaIds.length === 0 ? null : changes;
}
