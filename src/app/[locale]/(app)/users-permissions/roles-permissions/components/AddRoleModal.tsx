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
  onClose: () => void;
};

export default function AddRoleModal({ onClose }: Props) {
  const t = useTranslations("UsersPermissions.addRoleModal");

  const [form, setForm] = useState({
    roleName: "",
    accessLevel: "custom",
    modulesDescription: "selected",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    toast.success(t("roleAdded"));
    onClose();
  }

  return (
    <ModalWrapper onClose={onClose} width="max-w-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-[15px] font-bold text-gray-900">{t("title")}</h2>
        <CloseButton onClick={onClose} />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 px-6 py-5">
        {/* Role Name */}
        <FormField label={t("roleName")} required>
          <input
            type="text"
            value={form.roleName}
            onChange={(e) => update("roleName", e.target.value)}
            placeholder={t("roleNamePlaceholder")}
            className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
        </FormField>

        {/* Access Level */}
        <FormField label={t("accessLevel")}>
          <SelectWrapper>
            <select
              value={form.accessLevel}
              onChange={(e) => update("accessLevel", e.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            >
              <option value="custom">{t("accessLevels.custom")}</option>
              <option value="full">{t("accessLevels.full")}</option>
              <option value="readonly">{t("accessLevels.readonly")}</option>
            </select>
          </SelectWrapper>
        </FormField>

        {/* Modules Description */}
        <FormField label={t("modulesDescription")}>
          <SelectWrapper>
            <select
              value={form.modulesDescription}
              onChange={(e) => update("modulesDescription", e.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            >
              <option value="selected">{t("modules.selected")}</option>
              <option value="all">{t("modules.all")}</option>
            </select>
          </SelectWrapper>
        </FormField>
      </div>

      <ModalFooter
        onCancel={onClose}
        onConfirm={handleSave}
        cancelLabel={t("cancel")}
        confirmLabel={t("addRole")}
      />
    </ModalWrapper>
  );
}
