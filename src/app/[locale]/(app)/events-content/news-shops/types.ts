/** A choice in the form's project select (value: the project id). */
export type ProjectChoice = { value: string; label: string };

/** The article form's fields, as typed. */
export type NewsFormValues = {
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  /** A project id; "" until one is chosen. */
  project: string;
  status: "draft" | "published";
  /** Files picked in this form, not saved yet. */
  newMedia: File[];
  /** Saved photos and videos to remove on save (editing only). */
  removedMediaIds: number[];
};

/** Why a text field or the project can't be saved. */
export type NewsFieldError = "required" | "tooLong";

/** Why the photos and videos can't be saved; `name` is the file at fault. */
export type NewsMediaError =
  | { reason: "mediaRequired" | "tooMany" }
  | { reason: "mediaType" | "photoTooLarge" | "videoTooLarge"; name: string };

export type NewsFormErrors = Partial<
  Record<"titleEn" | "titleAr" | "contentEn" | "contentAr" | "project", NewsFieldError>
> & { media?: NewsMediaError };

export type NewsModalState = { mode: "create" } | { mode: "edit"; articleId: number } | null;
