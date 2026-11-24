"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { NewsArticle } from "@/src/services/newsShops";
import type { NewsFormErrors, NewsFormValues } from "../types";
import { emptyNewsForm, newsToForm, validateNewsForm } from "../utils";

type Options = {
  /** The article being edited, or null for a new one. */
  article: NewsArticle | null;
  pending: boolean;
  /** Saves the checked values; resolves true once saved. */
  save: (values: NewsFormValues) => Promise<boolean>;
};

/** The article form's state: the fields, the picked and removed files, their checks, and the save. */
export function useNewsForm({ article, pending, save }: Options) {
  const t = useTranslations("EventsContent.newsShops.form");
  const [form, setForm] = useState<NewsFormValues>(() => (article ? newsToForm(article) : emptyNewsForm()));
  const [errors, setErrors] = useState<NewsFormErrors>({});

  function update<K extends keyof NewsFormValues>(field: K, value: NewsFormValues[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
    const errorField = field === "newMedia" || field === "removedMediaIds" ? "media" : field;
    setErrors((previous) => ({ ...previous, [errorField]: undefined }));
  }

  function addMedia(files: File[]) {
    update("newMedia", [...form.newMedia, ...files]);
  }
  function dropNewMedia(index: number) {
    update("newMedia", form.newMedia.filter((_, position) => position !== index));
  }
  function removeSavedMedia(id: number) {
    update("removedMediaIds", [...form.removedMediaIds, id]);
  }

  async function handleSave() {
    if (pending) return;
    const found = validateNewsForm(form, article);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const published = form.status === "published";
    // "Published" and "saved as draft" only when that's what this save did.
    const statusChanged = article === null || article.published !== published;
    if (await save(form)) {
      toast.success(!statusChanged ? t("saved") : published ? t("savedPublished") : t("savedDraft"));
    }
  }

  return { form, errors, update, addMedia, dropNewMedia, removeSavedMedia, handleSave };
}
