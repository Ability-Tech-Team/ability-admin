"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import FormField from "@/src/components/FormField";
import ModalFooter from "@/src/components/ModalFooter";
import SelectWrapper from "@/src/components/SelectWrapper";
import type { ApiFailure } from "@/src/lib/apiFailure";
import {
  NEWS_MEDIA_MAX_FILES,
  NEWS_PHOTO_EXTENSIONS,
  NEWS_PHOTO_MAX_MB,
  NEWS_VIDEO_EXTENSIONS,
  NEWS_VIDEO_MAX_MB,
  type NewsArticle,
} from "@/src/services/newsShops";
import { useNewsForm } from "../hooks/useNewsForm";
import type { NewsFieldError, NewsFormValues, NewsMediaError, ProjectChoice } from "../types";
import { keptMedia, newsProjectChoices } from "../utils";

type Props = {
  /** The article being edited, or null for a new one. */
  article: NewsArticle | null;
  projectOptions: ProjectChoice[];
  projectsFailure: ApiFailure | null;
  pending: boolean;
  failure: ApiFailure | null;
  onCancel: () => void;
  /** Asks to delete the article; left out for a new one. */
  onDelete?: () => void;
  /** Resolves true once saved. */
  onSave: (values: NewsFormValues) => Promise<boolean>;
};

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400";
const textareaClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none";
const selectClass =
  "h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400";

/** The article's fields, its photos and videos, and the footer; styled as the guideline form. */
export default function NewsArticleForm({
  article,
  projectOptions,
  projectsFailure,
  pending,
  failure,
  onCancel,
  onDelete,
  onSave,
}: Props) {
  const t = useTranslations("EventsContent.newsShops.form");
  const mediaId = useId();
  const { form, errors, update, addMedia, dropNewMedia, removeSavedMedia, handleSave } = useNewsForm({
    article,
    pending,
    save: onSave,
  });
  const choices = newsProjectChoices(projectOptions, t("allProjects"), article);
  const saved = keptMedia(article, form.removedMediaIds);

  const errorText = (error: NewsFieldError | undefined) =>
    error ? <p className="mt-1 text-[10px] text-red-600">{t(`errors.${error}`)}</p> : null;

  function mediaErrorText(error: NewsMediaError): string {
    switch (error.reason) {
      case "mediaRequired":
        return t("errors.mediaRequired");
      case "tooMany":
        return t("errors.tooMany", { max: NEWS_MEDIA_MAX_FILES });
      case "mediaType":
        return t("errors.mediaType", { name: error.name });
      case "photoTooLarge":
        return t("errors.photoTooLarge", { name: error.name, max: NEWS_PHOTO_MAX_MB });
      case "videoTooLarge":
        return t("errors.videoTooLarge", { name: error.name, max: NEWS_VIDEO_MAX_MB });
    }
  }

  const removeButton = (name: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("removeItem", { name })}
      className="shrink-0 text-[11px] font-medium text-red-600 hover:text-red-700 transition-colors"
    >
      {t("remove")}
    </button>
  );

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <fieldset disabled={pending} className="flex min-w-0 flex-col gap-4 px-6 py-5">
          {/* Title EN + AR */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label={t("titleEn")} required>
              <input
                type="text"
                value={form.titleEn}
                onChange={(e) => update("titleEn", e.target.value)}
                aria-invalid={Boolean(errors.titleEn)}
                className={inputClass}
              />
              {errorText(errors.titleEn)}
            </FormField>
            <FormField label={t("titleAr")} required>
              <input
                type="text"
                dir="rtl"
                value={form.titleAr}
                onChange={(e) => update("titleAr", e.target.value)}
                aria-invalid={Boolean(errors.titleAr)}
                className={inputClass}
              />
              {errorText(errors.titleAr)}
            </FormField>
          </div>

          {/* Project + Publishing Status */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FormField label={t("project")} required>
                <SelectWrapper>
                  <select
                    value={form.project}
                    onChange={(e) => update("project", e.target.value)}
                    aria-invalid={Boolean(errors.project)}
                    className={selectClass}
                  >
                    <option value="">{t("chooseProject")}</option>
                    {choices.map((choice) => (
                      <option key={choice.value} value={choice.value}>{choice.label}</option>
                    ))}
                  </select>
                </SelectWrapper>
              </FormField>
              {errorText(errors.project)}
            </div>
            <FormField label={t("publishingStatus")}>
              <SelectWrapper>
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value === "published" ? "published" : "draft")}
                  className={selectClass}
                >
                  <option value="draft">{t("draft")}</option>
                  <option value="published">{t("published")}</option>
                </select>
              </SelectWrapper>
            </FormField>
          </div>
          {projectsFailure && <ApiFailureNotice failure={projectsFailure} />}

          {/* Content EN + AR */}
          <FormField label={t("contentEn")} required>
            <textarea
              value={form.contentEn}
              onChange={(e) => update("contentEn", e.target.value)}
              rows={5}
              aria-invalid={Boolean(errors.contentEn)}
              className={textareaClass}
            />
            {errorText(errors.contentEn)}
          </FormField>
          <FormField label={t("contentAr")} required>
            <textarea
              dir="rtl"
              value={form.contentAr}
              onChange={(e) => update("contentAr", e.target.value)}
              rows={5}
              aria-invalid={Boolean(errors.contentAr)}
              className={textareaClass}
            />
            {errorText(errors.contentAr)}
          </FormField>

          {/* Photos and videos */}
          <div>
            <label htmlFor={mediaId} className="mb-1 block text-[11px] font-medium text-gray-700">
              {t("media")}
              <span className="text-red-500"> *</span>
            </label>
            {(saved.length > 0 || form.newMedia.length > 0) && (
              <ul className="mb-2 flex flex-col gap-1">
                {saved.map((item, index) => {
                  const name = t(item.type === "video" ? "video" : "photo", { number: index + 1 });
                  return (
                    <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-1.5">
                      <a
                        href={item.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {name}
                      </a>
                      {removeButton(name, () => removeSavedMedia(item.id))}
                    </li>
                  );
                })}
                {form.newMedia.map((file, index) => (
                  <li key={`${index}-${file.name}`} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-1.5">
                    <span className="truncate text-[11px] text-gray-700">{file.name}</span>
                    {removeButton(file.name, () => dropNewMedia(index))}
                  </li>
                ))}
              </ul>
            )}
            <input
              id={mediaId}
              type="file"
              multiple
              accept={[...NEWS_PHOTO_EXTENSIONS, ...NEWS_VIDEO_EXTENSIONS].join(",")}
              onChange={(e) => {
                addMedia(Array.from(e.target.files ?? []));
                // The picked files are listed above; clearing lets the same one be picked again.
                e.target.value = "";
              }}
              aria-invalid={Boolean(errors.media)}
              aria-describedby={`${mediaId}-hint`}
              className="block w-full text-[11px] text-gray-600 file:me-3 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-2.5 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 hover:file:bg-gray-50"
            />
            <p id={`${mediaId}-hint`} className="mt-1 text-[10px] text-gray-400">
              {t("mediaHint", { photo: NEWS_PHOTO_MAX_MB, video: NEWS_VIDEO_MAX_MB, count: NEWS_MEDIA_MAX_FILES })}
            </p>
            {errors.media && <p className="mt-1 text-[10px] text-red-600">{mediaErrorText(errors.media)}</p>}
          </div>

          {failure && <ApiFailureNotice failure={failure} />}
        </fieldset>
      </div>

      <ModalFooter
        onCancel={onCancel}
        onConfirm={() => void handleSave()}
        cancelLabel={t("cancel")}
        confirmLabel={pending ? t("saving") : t("save")}
        onDelete={onDelete && (() => { if (!pending) onDelete(); })}
        deleteLabel={t("delete")}
      />
    </>
  );
}
