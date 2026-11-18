"use client";

import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";

type Props = {
  onClose: () => void;
};

export default function AddFamilyMemberModal({ onClose }: Props) {
  const t = useTranslations("MasterData");

  return (
    <ModalWrapper onClose={onClose} width="max-w-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-[15px] font-bold text-gray-900">{t("addFamilyMemberModal.title")}</h2>
            <CloseButton onClick={onClose} />
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4 px-6 overflow-y-auto flex-1">
            {/* Full Name */}
            <FormField label={t("addFamilyMemberModal.fullName")} required>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* ID / Passport Type */}
            <FormField label={t("addFamilyMemberModal.idPassportType")} required>
              <input
                type="text"
                placeholder={t("addFamilyMemberModal.idPassportType")}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* ID / Passport Number */}
            <FormField label={t("addFamilyMemberModal.idPassportNumber")} required>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Mobile Number */}
            <FormField label={t("addFamilyMemberModal.mobileNumber")} required>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Email Address */}
            <FormField label={t("addFamilyMemberModal.email")} required>
              <input
                type="email"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Assign to Unit */}
            <FormField label={t("addFamilyMemberModal.assignToUnit")} required>
              <input
                type="text"
                placeholder={t("addFamilyMemberModal.assignToUnit")}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Relationship */}
            <FormField label={t("addFamilyMemberModal.relationship")}>
              <input
                type="text"
                placeholder={t("addFamilyMemberModal.relationship")}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* File upload */}
            <div>
              <input
                type="file"
                className="w-full text-[12px] text-gray-700 file:mr-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 hover:file:bg-gray-50"
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
              {t("addFamilyMemberModal.saveAndAddAnother")}
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              {t("addFamilyMemberModal.submit")}
            </button>
          </div>
    </ModalWrapper>
  );
}
