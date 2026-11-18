"use client";

import { useTranslations } from "next-intl";
import type { Project } from "@/src/services/projects";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";

type Props = {
  project: Project;
  onClose: () => void;
};

export default function EditProjectModal({ project, onClose }: Props) {
  const t = useTranslations("MasterData");

  return (
    <ModalWrapper onClose={onClose} width="max-w-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-[15px] font-bold text-gray-900">{t("editProject.title")}</h2>
            <CloseButton onClick={onClose} />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6 overflow-y-auto flex-1">
            {/* Project Name (EN) */}
            <FormField label={t("editProject.nameEn")} required>
              <input
                type="text"
                defaultValue={project.name}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Project Name (AR) */}
            <FormField label={t("editProject.nameAr")} required>
              <input
                type="text"
                defaultValue={project.nameAr}
                dir="rtl"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </FormField>

            {/* Type */}
            <div className="col-span-2">
              <FormField label={t("editProject.type")}>
                <input
                  type="text"
                  defaultValue={t(`types.${project.type}` as Parameters<typeof t>[0])}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                />
              </FormField>
            </div>

            {/* Location */}
            <div className="col-span-2">
              <FormField label={t("editProject.location")}>
                <input
                  type="text"
                  defaultValue={project.location}
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                />
              </FormField>
            </div>

            {/* Google Maps Link */}
            <div className="col-span-2">
              <FormField label={t("editProject.googleMapsLink")}>
                <input
                  type="text"
                  defaultValue="https://maps.google.com/..."
                  placeholder="https://maps.google.com/..."
                  className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                />
              </FormField>
            </div>

            {/* Google Maps Boundary — 4 Points */}
            <div className="col-span-2">
              <p className="mb-2 text-[11px] font-semibold text-gray-900">
                {t("editProject.boundaryTitle")}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-gray-500">
                    {t("editProject.point1")}
                  </label>
                  <input
                    type="text"
                    defaultValue="30.0444, 31.2357"
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-gray-500">
                    {t("editProject.point2")}
                  </label>
                  <input
                    type="text"
                    defaultValue="30.0450, 31.2370"
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-gray-500">
                    {t("editProject.point3")}
                  </label>
                  <input
                    type="text"
                    defaultValue="30.0435, 31.2374"
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-gray-500">
                    {t("editProject.point4")}
                  </label>
                  <input
                    type="text"
                    defaultValue="30.0430, 31.2360"
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Project Manager */}
            <div className="col-span-2">
              <FormField label={t("editProject.manager")}>
                <input
                  type="text"
                  defaultValue={project.manager}
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
              {t("cancel")}
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              {t("saveChanges")}
            </button>
          </div>
    </ModalWrapper>
  );
}
