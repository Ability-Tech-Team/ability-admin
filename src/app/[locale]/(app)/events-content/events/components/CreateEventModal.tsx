"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import SelectWrapper from "@/src/components/SelectWrapper";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";

type Props = {
  projectOptions: { value: string; label: string }[];
  onClose: () => void;
};

export default function CreateEventModal({ projectOptions, onClose }: Props) {
  const t = useTranslations("EventsContent.createModal");
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    description: "",
    date: "",
    time: "",
    capacity: "",
    location: "",
    project: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <ModalWrapper onClose={onClose} width="max-w-[560px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-[15px] font-bold text-gray-900">{t("title")}</h2>
        <CloseButton onClick={onClose} />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 px-6 py-5">
        {/* Title EN + AR */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("titleEn")} required>
            <input
              type="text"
              value={form.titleEn}
              onChange={(e) => update("titleEn", e.target.value)}
              placeholder={t("titleEnPlaceholder")}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </FormField>
          <FormField label={t("titleAr")} required>
            <input
              type="text"
              dir="rtl"
              value={form.titleAr}
              onChange={(e) => update("titleAr", e.target.value)}
              placeholder={t("titleArPlaceholder")}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </FormField>
        </div>

        {/* Description */}
        <FormField label={t("description")}>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
          />
        </FormField>

        {/* Date + Time + Capacity */}
        <div className="grid grid-cols-3 gap-3">
          <FormField label={t("date")} required>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </FormField>
          <FormField label={t("time")} required>
            <input
              type="time"
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </FormField>
          <FormField label={t("capacity")}>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => update("capacity", e.target.value)}
              placeholder="50"
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </FormField>
        </div>

        {/* Location + Project */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("location")}>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder={t("locationPlaceholder")}
              className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </FormField>
          <FormField label={t("project")}>
            <SelectWrapper>
              <select
                value={form.project}
                onChange={(e) => update("project", e.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              >
                <option value="">{t("allProjects")}</option>
                {projectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </FormField>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={() => {
            toast.success(t("savedAsDraft"));
            onClose();
          }}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t("saveDraft")}
        </button>
        <button
          type="button"
          onClick={() => {
            toast.success(t("eventPublished"));
            onClose();
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {t("publishEvent")}
        </button>
      </div>
    </ModalWrapper>
  );
}
