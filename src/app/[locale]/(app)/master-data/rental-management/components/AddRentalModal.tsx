"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

type Props = {
  onClose: () => void;
};

export default function AddRentalModal({ onClose }: Props) {
  const t = useTranslations("MasterData");

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
        <div className="w-[520px] max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-[15px] font-bold text-gray-900">{t("addRentalModal.title")}</h2>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6">
            {/* Unit */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("addRentalModal.unit")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>

            {/* Tenant Name */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("addRentalModal.tenantName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>

            {/* ID / Passport Type */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("addRentalModal.idPassportType")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue="ID"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>

            {/* ID / Passport Number */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("addRentalModal.idPassportNumber")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>

            {/* Tenant Attachments */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("addRentalModal.tenantAttachments")}
              </label>
              <input
                type="file"
                className="w-full text-[12px] text-gray-700 file:mr-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 hover:file:bg-gray-50"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("addRentalModal.startDate")}
              </label>
              <input
                type="date"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("addRentalModal.endDate")}
              </label>
              <input
                type="date"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>

            {/* Annual Rent (EGP) */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("addRentalModal.annualRent")}
              </label>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 pt-5 pb-5">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              className="rounded-lg border border-blue-600 px-4 py-2 text-[12px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
            >
              {t("addRentalModal.saveAndAddAnother")}
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              {t("addRentalModal.submit")}
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
