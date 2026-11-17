"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import type { Project } from "@/src/services/projects";

type Props = {
  project: Project;
  onClose: () => void;
};

export default function EditProjectModal({ project, onClose }: Props) {
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
            <h2 className="text-[15px] font-bold text-gray-900">{t("editProject.title")}</h2>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6">
            {/* Project Name (EN) */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("editProject.nameEn")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={project.name}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>

            {/* Project Name (AR) */}
            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("editProject.nameAr")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue={project.nameAr}
                dir="rtl"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>

            {/* Type */}
            <div className="col-span-2">
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("editProject.type")}
              </label>
              <input
                type="text"
                defaultValue={t(`types.${project.type}` as Parameters<typeof t>[0])}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>

            {/* Location */}
            <div className="col-span-2">
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("editProject.location")}
              </label>
              <input
                type="text"
                defaultValue={project.location}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>

            {/* Google Maps Link */}
            <div className="col-span-2">
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("editProject.googleMapsLink")}
              </label>
              <input
                type="text"
                defaultValue="https://maps.google.com/..."
                placeholder="https://maps.google.com/..."
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
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
              <label className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("editProject.manager")}
              </label>
              <input
                type="text"
                defaultValue={project.manager}
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
              className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              {t("saveChanges")}
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
