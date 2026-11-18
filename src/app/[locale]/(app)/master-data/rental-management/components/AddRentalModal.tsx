"use client";

import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";

type Props = {
  onClose: () => void;
};

export default function AddRentalModal({ onClose }: Props) {
  const t = useTranslations("MasterData");

  return (
    <ModalWrapper onClose={onClose} width="max-w-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-[15px] font-bold text-gray-900">{t("addRentalModal.title")}</h2>
            <CloseButton onClick={onClose} />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6 overflow-y-auto flex-1">
            {/* Unit */}
            <FormField label={t("addRentalModal.unit")} required>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Tenant Name */}
            <FormField label={t("addRentalModal.tenantName")} required>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* ID / Passport Type */}
            <FormField label={t("addRentalModal.idPassportType")} required>
              <input
                type="text"
                placeholder={t("addRentalModal.idPassportType")}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* ID / Passport Number */}
            <FormField label={t("addRentalModal.idPassportNumber")} required>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Tenant Attachments */}
            <FormField label={t("addRentalModal.tenantAttachments")}>
              <input
                type="file"
                className="w-full text-[12px] text-gray-700 file:mr-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 hover:file:bg-gray-50"
              />
            </FormField>

            {/* Start Date */}
            <FormField label={t("addRentalModal.startDate")}>
              <input
                type="date"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* End Date */}
            <FormField label={t("addRentalModal.endDate")}>
              <input
                type="date"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Annual Rent (EGP) */}
            <FormField label={t("addRentalModal.annualRent")}>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>
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
    </ModalWrapper>
  );
}
