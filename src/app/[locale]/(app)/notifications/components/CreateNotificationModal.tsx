"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  onClose: () => void;
};

export default function CreateNotificationModal({ onClose }: Props) {
  const t = useTranslations("Notifications");
  const [activeTab, setActiveTab] = useState<"en" | "ar">("en");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
        <div
          className="w-[580px] max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-[15px] font-bold text-gray-900">{t("createModal.title")}</h2>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
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
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">
                  {t("createModal.titleEn")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t("createModal.titleEnPlaceholder")}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">
                  {t("createModal.titleAr")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder={t("createModal.titleArPlaceholder")}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                />
              </div>
            </div>

            {/* Body (English) */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("createModal.bodyEn")}
              </label>
              <textarea
                rows={3}
                placeholder={t("createModal.bodyEnPlaceholder")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
              />
            </div>

            {/* Body (Arabic) */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("createModal.bodyAr")}
              </label>
              <textarea
                rows={3}
                dir="rtl"
                placeholder={t("createModal.bodyArPlaceholder")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
              />
            </div>

            {/* Notification Type + Target Audience */}
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">
                  {t("createModal.notificationType")}
                </label>
                <input
                  type="text"
                  defaultValue="Announcement"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">
                  {t("createModal.targetAudience")}
                </label>
                <input
                  type="text"
                  defaultValue="All Residents"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                />
              </div>
            </div>

            {/* Project + Status */}
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">
                  {t("createModal.project")}
                </label>
                <input
                  type="text"
                  defaultValue="All Projects"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">
                  {t("createModal.status")}
                </label>
                <input
                  type="text"
                  defaultValue="Save as Draft"
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                />
              </div>
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
        </div>
      </div>
    </>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
