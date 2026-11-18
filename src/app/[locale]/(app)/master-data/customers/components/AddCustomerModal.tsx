"use client";

import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";

type Props = {
  onClose: () => void;
};

export default function AddCustomerModal({ onClose }: Props) {
  const t = useTranslations("MasterData");

  return (
    <ModalWrapper onClose={onClose} width="max-w-[560px]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-[15px] font-bold text-gray-900">{t("addCustomerModal.title")}</h2>
            <CloseButton onClick={onClose} />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6 overflow-y-auto flex-1">
            {/* Customer Name */}
            <FormField label={t("addCustomerModal.customerName")} required>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Mobile Number */}
            <FormField label={t("addCustomerModal.mobileNumber")} required>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Email */}
            <FormField label={t("addCustomerModal.email")}>
              <input
                type="email"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* ID / Passport Type */}
            <FormField label={t("addCustomerModal.idPassportType")}>
              <input
                type="text"
                placeholder={t("addCustomerModal.idPassportType")}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* ID / Passport Number */}
            <FormField label={t("addCustomerModal.idPassportNumber")} required>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Nationality */}
            <FormField label={t("addCustomerModal.nationality")}>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Project */}
            <FormField label={t("addCustomerModal.project")} required>
              <input
                type="text"
                placeholder={t("addCustomerModal.project")}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Assigned Unit */}
            <FormField label={t("addCustomerModal.assignedUnit")}>
              <input
                type="text"
                placeholder={t("addCustomerModal.assignedUnit")}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Join Date */}
            <FormField label={t("addCustomerModal.joinDate")} required>
              <input
                type="date"
                defaultValue=""
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Identity Attachment */}
            <FormField label={t("addCustomerModal.identityAttachment")}>
              <input
                type="file"
                className="h-9 w-full text-[12px] text-gray-700 file:mr-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 hover:file:bg-gray-50"
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
              {t("addCustomerModal.saveAndAddAnother")}
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              {t("addCustomerModal.submit")}
            </button>
          </div>
    </ModalWrapper>
  );
}
