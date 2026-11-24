"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import ModalFooter from "@/src/components/ModalFooter";
import ModalWrapper from "@/src/components/ModalWrapper";
import SelectWrapper from "@/src/components/SelectWrapper";
import type { ApiFailure } from "@/src/lib/apiFailure";
import type { PhoneContact } from "@/src/services/phoneDirectory";
import type { PhoneContactFormErrors, PhoneContactFormValues, ProjectChoice } from "../types";
import { contactProjectChoices, contactToForm, emptyContactForm, validateContactForm } from "../utils";

type Props = {
  /** The contact being edited, or null for a new one. */
  contact: PhoneContact | null;
  projectOptions: ProjectChoice[];
  projectsFailure: ApiFailure | null;
  pending: boolean;
  failure: ApiFailure | null;
  onClose: () => void;
  /** Asks to delete the contact; left out for a new one. */
  onDelete?: () => void;
  /** Resolves true once saved. */
  onSave: (values: PhoneContactFormValues) => Promise<boolean>;
};

const TITLE_ID = "phone-contact-title";
const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400";
const selectClass =
  "h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400";

/** Adding or editing a phone directory contact; styled as the guideline form. */
export default function PhoneContactModal({
  contact,
  projectOptions,
  projectsFailure,
  pending,
  failure,
  onClose,
  onDelete,
  onSave,
}: Props) {
  const t = useTranslations("EventsContent.phoneDir.form");
  const [form, setForm] = useState<PhoneContactFormValues>(() =>
    contact ? contactToForm(contact) : emptyContactForm(),
  );
  const [errors, setErrors] = useState<PhoneContactFormErrors>({});
  const choices = contactProjectChoices(projectOptions, t("allProjects"), contact);

  function update<K extends keyof PhoneContactFormValues>(field: K, value: PhoneContactFormValues[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function handleSave() {
    if (pending) return;
    const found = validateContactForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (await onSave(form)) toast.success(t("saved"));
  }

  const errorText = (field: keyof PhoneContactFormErrors) =>
    errors[field] ? <p className="mt-1 text-[10px] text-red-600">{t(`errors.${errors[field]}`)}</p> : null;

  return (
    <ModalWrapper onClose={onClose} width="max-w-[560px]" labelledBy={TITLE_ID}>
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 id={TITLE_ID} className="text-[15px] font-bold text-gray-900">{t(contact ? "editTitle" : "newTitle")}</h2>
        <CloseButton onClick={onClose} label={t("close")} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <fieldset disabled={pending} className="flex min-w-0 flex-col gap-4 px-6 py-5">
          {/* Name EN + AR */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label={t("nameEn")} required>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => update("nameEn", e.target.value)}
                aria-invalid={Boolean(errors.nameEn)}
                className={inputClass}
              />
              {errorText("nameEn")}
            </FormField>
            <FormField label={t("nameAr")} required>
              <input
                type="text"
                dir="rtl"
                value={form.nameAr}
                onChange={(e) => update("nameAr", e.target.value)}
                aria-invalid={Boolean(errors.nameAr)}
                className={inputClass}
              />
              {errorText("nameAr")}
            </FormField>
          </div>

          <FormField label={t("phone")} required>
            <input
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              aria-invalid={Boolean(errors.phone)}
              className={inputClass}
            />
            {errorText("phone")}
          </FormField>

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
              {errorText("project")}
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
          {failure && <ApiFailureNotice failure={failure} />}
        </fieldset>
      </div>

      <ModalFooter
        onCancel={onClose}
        onConfirm={() => void handleSave()}
        cancelLabel={t("cancel")}
        confirmLabel={pending ? t("saving") : t("save")}
        onDelete={onDelete && (() => { if (!pending) onDelete(); })}
        deleteLabel={t("delete")}
      />
    </ModalWrapper>
  );
}
