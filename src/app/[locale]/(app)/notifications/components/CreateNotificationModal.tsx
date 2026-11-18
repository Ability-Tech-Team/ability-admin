"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";

type Props = {
  onClose: () => void;
};

export default function CreateNotificationModal({ onClose }: Props) {
  const t = useTranslations("Notifications");
  const [activeTab, setActiveTab] = useState<"en" | "ar">("en");

  return (
    <ModalWrapper onClose={onClose} width="w-[580px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h2 className="text-[15px] font-bold text-gray-900">{t("createModal.title")}</h2>
        <CloseButton onClick={onClose} />
      </div>

      {/* Language tabs */}
      <div className="flex items-center gap-0 px-6 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("en")}
          className={`rounded-s-lg border px-4 py-1.5 text-[12px] font-medium transition-colors ${
            activeTab === "en"
              ? "border-gray-300 bg-white text-gray-900"
              : "border-gray-200 bg-gray-50 text-gray-400"
          }`}
        >
          {t("createModal.english")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ar")}
          className={`rounded-e-lg border border-s-0 px-4 py-1.5 text-[12px] font-medium transition-colors ${
            activeTab === "ar"
              ? "border-gray-300 bg-white text-gray-900"
              : "border-gray-200 bg-gray-50 text-gray-400"
          }`}
        >
          {t("createModal.arabic")}
        </button>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 px-6">
        {/* Title EN + AR */}
        <div className="grid grid-cols-2 gap-x-4">
          <FormField label={t("createModal.titleEn")} required>
            <input
              type="text"
              placeholder={t("createModal.titleEnPlaceholder")}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </FormField>
          <FormField label={t("createModal.titleAr")} required>
            <input
              type="text"
              dir="rtl"
              placeholder={t("createModal.titleArPlaceholder")}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </FormField>
        </div>

        {/* Body (English) */}
        <FormField label={t("createModal.bodyEn")}>
          <textarea
            rows={3}
            placeholder={t("createModal.bodyEnPlaceholder")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
          />
        </FormField>

        {/* Body (Arabic) */}
        <FormField label={t("createModal.bodyAr")}>
          <textarea
            rows={3}
            dir="rtl"
            placeholder={t("createModal.bodyArPlaceholder")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
          />
        </FormField>

        {/* Notification Type + Target Audience */}
        <div className="grid grid-cols-2 gap-x-4">
          <FormField label={t("createModal.notificationType")}>
            <input
              type="text"
              placeholder={t("createModal.notificationType")}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </FormField>
          <FormField label={t("createModal.targetAudience")}>
            <input
              type="text"
              placeholder={t("createModal.targetAudience")}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </FormField>
        </div>

        {/* Project + Status */}
        <div className="grid grid-cols-2 gap-x-4">
          <FormField label={t("createModal.project")}>
            <input
              type="text"
              placeholder={t("createModal.project")}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </FormField>
          <FormField label={t("createModal.status")}>
            <input
              type="text"
              placeholder={t("createModal.status")}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </FormField>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 pt-5 pb-5">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {t("createModal.cancel")}
        </button>
        <button
          className="rounded-lg border border-blue-600 px-4 py-2 text-[12px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        >
          {t("createModal.saveDraft")}
        </button>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          {t("createModal.sendNow")}
        </button>
      </div>
    </ModalWrapper>
  );
}
