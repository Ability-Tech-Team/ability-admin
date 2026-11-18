"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import SelectWrapper from "@/src/components/SelectWrapper";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import ModalFooter from "@/src/components/ModalFooter";

type Props = {
  projectOptions: { value: string; label: string }[];
  onClose: () => void;
};

export default function NewGuidelineModal({ projectOptions, onClose }: Props) {
  const t = useTranslations("EventsContent.guidelines.newModal");

  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    category: "community-guide",
    project: "",
    summary: "",
    contentMode: "text" as "text" | "pdf",
    guidelineText: "",
    pdfName: "",
    status: "draft",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    toast.success(t("savedAsDraft"));
    onClose();
  }

  return (
    <ModalWrapper onClose={onClose} width="max-w-[560px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-[15px] font-bold text-gray-900">{t("title")}</h2>
        <CloseButton onClick={onClose} />
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
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </FormField>
          <FormField label={t("titleAr")} required>
            <input
              type="text"
              dir="rtl"
              value={form.titleAr}
              onChange={(e) => update("titleAr", e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </FormField>
        </div>

        {/* Category + Project */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("category")}>
            <SelectWrapper>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
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
                <option value="">{t("allProjects")}</option>
                {projectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </FormField>
        </div>

        {/* Mobile Summary */}
        <FormField label={t("mobileSummary")}>
          <textarea
            value={form.summary}
            onChange={(e) => update("summary", e.target.value)}
            placeholder={t("mobileSummaryPlaceholder")}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
          />
        </FormField>

        {/* Guideline Content — Write Text / Upload PDF toggle */}
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-700">
            {t("guidelineContent")}
          </label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, contentMode: "text" }))}
              className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                form.contentMode === "text"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t("writeText")}
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, contentMode: "pdf" }))}
              className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                form.contentMode === "pdf"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t("uploadPdf")}
            </button>
          </div>
        </div>

        {/* Write Text area */}
        {form.contentMode === "text" && (
          <FormField label={t("guidelineText")}>
            <textarea
              value={form.guidelineText}
              onChange={(e) => update("guidelineText", e.target.value)}
              placeholder={t("guidelineTextPlaceholder")}
              rows={7}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </FormField>
        )}

        {/* PDF Document area */}
        {form.contentMode === "pdf" && (
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-700">
              {t("pdfDocument")}
            </label>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              id="pdf-upload-new"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setForm((p) => ({ ...p, pdfName: file.name }));
                e.target.value = "";
              }}
            />
            <label
              htmlFor="pdf-upload-new"
              className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-gray-200 px-4 py-6 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
            >
              <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-[11px] font-medium text-gray-700">
                {form.pdfName || t("pdfPlaceholder")}
              </p>
              <p className="text-[10px] text-gray-400">{t("pdfHint")}</p>
            </label>
            {form.pdfName && (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                <span className="text-[11px] text-gray-700">{form.pdfName}</span>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, pdfName: "" }))}
                  className="text-[11px] font-medium text-gray-500 hover:text-red-500 transition-colors"
                >
                  {t("remove")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Publishing Status */}
        <FormField label={t("publishingStatus")}>
          <SelectWrapper>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            >
              <option value="draft">{t("statuses.draft")}</option>
              <option value="published">{t("statuses.published")}</option>
            </select>
          </SelectWrapper>
        </FormField>
      </div>

      <ModalFooter
        onCancel={onClose}
        onConfirm={handleSave}
        cancelLabel={t("cancel")}
        confirmLabel={t("saveDraft")}
      />
    </ModalWrapper>
  );
}
