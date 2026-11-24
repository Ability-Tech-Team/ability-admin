"use client";

import { useTranslations } from "next-intl";
import SelectWrapper from "@/src/components/SelectWrapper";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import ModalFooter from "@/src/components/ModalFooter";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import type { Guideline, GuidelineInput } from "@/src/services/guidelines";
import { useGuidelineForm } from "../hooks/useGuidelineForm";
import type { GuidelineFormError, ProjectChoice } from "../types";
import { buildUpdateGuidelineInput, editProjectChoices, guidelineToForm } from "../utils";

type Props = {
  guideline: Guideline;
  projectOptions: ProjectChoice[];
  pending: boolean;
  failure: ApiFailure | null;
  onClose: () => void;
  /** Asks to delete the guideline. */
  onDelete: () => void;
  /** Resolves true once saved. */
  onSubmit: (input: Partial<GuidelineInput>) => Promise<boolean>;
};

const disabledClass = "disabled:cursor-not-allowed disabled:opacity-50";

export default function EditGuidelineModal({ guideline, projectOptions, pending, failure, onClose, onDelete, onSubmit }: Props) {
  const t = useTranslations("EventsContent.guidelines.editModal");
  const tGuidelines = useTranslations("EventsContent.guidelines");
  const tErrors = useTranslations("ProjectsScreen.errors");
  const tDelete = useTranslations("EventsContent.deleteDialog");
  // The API has no category, summary or PDF for a guideline.
  const notAvailable = useTranslations("UnitsScreen")("notAvailableYet");

  const { form, errors, update, handleSave } = useGuidelineForm({
    initial: () => guidelineToForm(guideline),
    pending,
    save: (values) => onSubmit(buildUpdateGuidelineInput(guideline, values)),
  });
  const choices = editProjectChoices(guideline, projectOptions, tGuidelines("newModal.allProjects"));

  function close() {
    if (!pending) onClose();
  }

  const errorText = (error: GuidelineFormError | undefined) =>
    error ? <p className="mt-1 text-[10px] text-red-600">{tErrors(error)}</p> : null;

  return (
    <ModalWrapper onClose={close} width="max-w-[560px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-[15px] font-bold text-gray-900">{t("title")}</h2>
        <CloseButton onClick={close} />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 px-6 py-5 overflow-y-auto">
        {/* Title EN + AR */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("titleEn")} required>
            <input
              type="text"
              value={form.titleEn}
              onChange={(e) => update("titleEn", e.target.value)}
              aria-invalid={Boolean(errors.titleEn)}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
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
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            {errorText(errors.titleAr)}
          </FormField>
        </div>

        {/* Category + Project */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("category")}>
            <SelectWrapper>
              <select
                defaultValue="community-guide"
                disabled
                title={notAvailable}
                className={`h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 ${disabledClass}`}
              >
                <option value="community-guide">{t("categories.community-guide")}</option>
                <option value="resident-guide">{t("categories.resident-guide")}</option>
                <option value="facility-rules">{t("categories.facility-rules")}</option>
              </select>
            </SelectWrapper>
          </FormField>
          <FormField label={t("project")}>
            <SelectWrapper>
              <select
                value={form.project}
                onChange={(e) => update("project", e.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              >
                {choices.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </FormField>
        </div>

        {/* Mobile Summary */}
        <FormField label={t("mobileSummary")}>
          <textarea
            disabled
            title={notAvailable}
            placeholder={t("mobileSummaryPlaceholder")}
            rows={3}
            className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none ${disabledClass}`}
          />
        </FormField>

        {/* Guideline Content — Write Text / Upload PDF toggle (the API saves text only) */}
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-700">
            {t("guidelineContent")}
          </label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              className="flex-1 py-2 text-[11px] font-medium transition-colors bg-blue-600 text-white"
            >
              {t("writeText")}
            </button>
            <button
              type="button"
              disabled
              title={notAvailable}
              className={`flex-1 py-2 text-[11px] font-medium transition-colors bg-white text-gray-600 hover:bg-gray-50 ${disabledClass}`}
            >
              {t("uploadPdf")}
            </button>
          </div>
        </div>

        {/* Write Text area */}
        <FormField label={t("guidelineText")}>
          <textarea
            value={form.text}
            onChange={(e) => update("text", e.target.value)}
            placeholder={t("guidelineTextPlaceholder")}
            rows={7}
            aria-invalid={Boolean(errors.text)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
          />
          {errorText(errors.text)}
        </FormField>

        {/* Publishing Status */}
        <FormField label={t("publishingStatus")}>
          <SelectWrapper>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value === "published" ? "published" : "draft")}
              className="h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            >
              <option value="published">{t("statuses.published")}</option>
              <option value="draft">{t("statuses.draft")}</option>
            </select>
          </SelectWrapper>
        </FormField>

        {failure && <ApiFailureNotice failure={failure} />}
      </div>

      <ModalFooter
        onCancel={close}
        onConfirm={handleSave}
        cancelLabel={t("cancel")}
        confirmLabel={t("savePublish")}
        onDelete={() => {
          if (!pending) onDelete();
        }}
        deleteLabel={tDelete("delete")}
      />
    </ModalWrapper>
  );
}
