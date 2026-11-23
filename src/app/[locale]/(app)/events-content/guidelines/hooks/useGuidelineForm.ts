"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { GuidelineFormErrors, GuidelineFormValues } from "../types";
import { validateGuidelineForm } from "../utils";

type Options = {
  initial: () => GuidelineFormValues;
  pending: boolean;
  /** Saves the checked values; resolves true once saved. */
  save: (values: GuidelineFormValues) => Promise<boolean>;
};

/**
 * The new and edit guideline forms' state: the fields, their checks, and the save, which
 * confirms with "saved as draft" or "published" after the API has saved it.
 */
export function useGuidelineForm({ initial, pending, save }: Options) {
  const t = useTranslations("EventsContent.guidelines");
  const [form, setForm] = useState<GuidelineFormValues>(initial);
  const [errors, setErrors] = useState<GuidelineFormErrors>({});

  function update<K extends keyof GuidelineFormValues>(field: K, value: GuidelineFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (pending) return;
    const found = validateGuidelineForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const published = form.status === "published";
    if (await save(form)) {
      toast.success(published ? t("editModal.guidelinePublished") : t("newModal.savedAsDraft"));
    }
  }

  return { form, errors, update, handleSave };
}
