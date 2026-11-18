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

export default function InviteUserModal({ projectOptions, onClose }: Props) {
  const t = useTranslations("UsersPermissions.inviteModal");

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "fm-manager",
    projectAccess: "All Projects",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    toast.success(t("invitationSent"));
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
        {/* Full Name + Email */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("fullName")} required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder={t("fullNamePlaceholder")}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </FormField>
          <FormField label={t("email")} required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </FormField>
        </div>

        {/* Role */}
        <FormField label={t("role")} required>
          <SelectWrapper>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            >
              <option value="super-admin">{t("roles.super-admin")}</option>
              <option value="fm-manager">{t("roles.fm-manager")}</option>
              <option value="cms-editor">{t("roles.cms-editor")}</option>
              <option value="operations-staff">{t("roles.operations-staff")}</option>
              <option value="finance-manager">{t("roles.finance-manager")}</option>
            </select>
          </SelectWrapper>
        </FormField>

        {/* Project Access */}
        <FormField label={t("projectAccess")} required>
          <SelectWrapper>
            <select
              value={form.projectAccess}
              onChange={(e) => update("projectAccess", e.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            >
              <option value="All Projects">{t("allProjects")}</option>
              {projectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </SelectWrapper>
        </FormField>
      </div>

      <ModalFooter
        onCancel={onClose}
        onConfirm={handleSave}
        cancelLabel={t("cancel")}
        confirmLabel={t("sendInvitation")}
      />
    </ModalWrapper>
  );
}
