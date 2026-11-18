"use client";

import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";

type Props = {
  onClose: () => void;
};

export default function AddUnitModal({ onClose }: Props) {
  const t = useTranslations("MasterData");

  return (
    <ModalWrapper onClose={onClose} width="max-w-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-[15px] font-bold text-gray-900">{t("addUnitModal.title")}</h2>
            <CloseButton onClick={onClose} />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6 overflow-y-auto flex-1">
            {/* Project */}
            <FormField label={t("addUnitModal.project")} required>
              <input
                type="text"
                placeholder={t("addUnitModal.project")}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Building */}
            <FormField label={t("addUnitModal.building")} required>
              <input
                type="text"
                placeholder={t("addUnitModal.building")}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Unit Number */}
            <FormField label={t("addUnitModal.unitNumber")} required>
              <input
                type="text"
                placeholder="301"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Floor */}
            <FormField label={t("addUnitModal.floor")}>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Unit Type */}
            <FormField label={t("addUnitModal.unitType")}>
              <input
                type="text"
                placeholder={t("addUnitModal.unitType")}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Contract */}
            <FormField label={t("addUnitModal.contract")} required>
              <input
                type="text"
                placeholder={t("addUnitModal.contract")}
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
              className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              {t("addUnitModal.submit")}
            </button>
          </div>
    </ModalWrapper>
  );
}
