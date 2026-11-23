"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import SelectWrapper from "@/src/components/SelectWrapper";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import type { ApiFailure } from "@/src/lib/apiFailure";
import { ALL_PROJECTS_ID, type CommunityEvent } from "@/src/services/events";
import type { EventFormError, EventFormErrors, EventFormValues } from "../types";
import { emptyEventForm, eventToForm, validateEventForm } from "../utils";

type Props =
  | {
      /**
       * The API's create route also requires an image and a ticketing link, which this form
       * has no fields for, so creating can't be saved yet and its buttons stay disabled.
       */
      mode: "create";
      event: null;
      projectOptions: { value: string; label: string }[];
      pending: boolean;
      failure: ApiFailure | null;
      onClose: () => void;
      onSubmit?: undefined;
    }
  | {
      mode: "edit";
      event: CommunityEvent;
      projectOptions: { value: string; label: string }[];
      pending: boolean;
      failure: ApiFailure | null;
      onClose: () => void;
      /** Save Draft saves it unpublished, Publish Event published. */
      onSubmit: (values: EventFormValues, published: boolean) => void;
    };

const ERROR_KEYS: Record<EventFormError, string> = {
  required: "ProjectsScreen.errors.required",
  tooLong: "ProjectsScreen.errors.tooLong",
  capacity: "EventsScreen.errors.capacity",
};

export default function CreateEventModal(props: Props) {
  const { mode, event, projectOptions, pending, failure, onClose } = props;
  const t = useTranslations("EventsContent.createModal");
  const tScreen = useTranslations("EventsScreen");
  const tUnits = useTranslations("UnitsScreen");
  const tAll = useTranslations();
  const locale = useLocale();
  const [form, setForm] = useState<EventFormValues>(() =>
    event ? eventToForm(event, locale) : emptyEventForm(),
  );
  const [errors, setErrors] = useState<EventFormErrors>({});

  // The event's own project, even when the project list couldn't load (non-Super Admin roles).
  const options =
    event && event.projectId !== ALL_PROJECTS_ID && !projectOptions.some((opt) => opt.value === String(event.projectId))
      ? [{ value: String(event.projectId), label: event.projectName }, ...projectOptions]
      : projectOptions;

  function update(field: keyof EventFormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function close() {
    if (!pending) onClose();
  }

  function submit(published: boolean) {
    if (pending || props.mode !== "edit") return;
    const found = validateEventForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    props.onSubmit(form, published);
  }

  const errorText = (field: keyof EventFormValues) =>
    errors[field] ? (
      <span className="mt-1 block text-[10px] text-red-600">
        {tAll(ERROR_KEYS[errors[field]] as Parameters<typeof tAll>[0])}
      </span>
    ) : null;

  const invalid = (field: keyof EventFormValues) => (errors[field] ? "border-red-300" : "border-gray-200");
  const canSave = mode === "edit";

  return (
    <ModalWrapper onClose={close} width="max-w-[560px]" labelledBy="event-form-title">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 id="event-form-title" className="text-[15px] font-bold text-gray-900">
          {mode === "edit" ? tScreen("editTitle") : t("title")}
        </h2>
        <CloseButton onClick={close} />
      </div>

      {/* Body */}
      <fieldset disabled={pending} className="flex flex-col gap-4 px-6 py-5 overflow-y-auto">
        {/* Title EN + AR */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("titleEn")} required>
            <input
              type="text"
              value={form.titleEn}
              onChange={(e) => update("titleEn", e.target.value)}
              placeholder={t("titleEnPlaceholder")}
              aria-invalid={Boolean(errors.titleEn)}
              className={`h-9 w-full rounded-lg border ${invalid("titleEn")} px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
            />
            {errorText("titleEn")}
          </FormField>
          <FormField label={t("titleAr")} required>
            <input
              type="text"
              dir="rtl"
              value={form.titleAr}
              onChange={(e) => update("titleAr", e.target.value)}
              placeholder={t("titleArPlaceholder")}
              aria-invalid={Boolean(errors.titleAr)}
              className={`h-9 w-full rounded-lg border ${invalid("titleAr")} px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
            />
            {errorText("titleAr")}
          </FormField>
        </div>

        {/* Description */}
        <FormField label={t("description")}>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={3}
            aria-invalid={Boolean(errors.description)}
            className={`w-full rounded-lg border ${invalid("description")} px-3 py-2 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none`}
          />
          {errorText("description")}
        </FormField>

        {/* Date + Time + Capacity */}
        <div className="grid grid-cols-3 gap-3">
          <FormField label={t("date")} required>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              aria-invalid={Boolean(errors.date)}
              className={`h-9 w-full rounded-lg border ${invalid("date")} px-3 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
            />
            {errorText("date")}
          </FormField>
          <FormField label={t("time")} required>
            <input
              type="time"
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              aria-invalid={Boolean(errors.time)}
              className={`h-9 w-full rounded-lg border ${invalid("time")} px-3 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
            />
            {errorText("time")}
          </FormField>
          <FormField label={t("capacity")}>
            <input
              type="number"
              min={1}
              step={1}
              value={form.capacity}
              onChange={(e) => update("capacity", e.target.value)}
              placeholder="50"
              aria-invalid={Boolean(errors.capacity)}
              className={`h-9 w-full rounded-lg border ${invalid("capacity")} px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
            />
            {errorText("capacity")}
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
              aria-invalid={Boolean(errors.location)}
              className={`h-9 w-full rounded-lg border ${invalid("location")} px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
            />
            {errorText("location")}
          </FormField>
          <FormField label={t("project")}>
            <SelectWrapper>
              <select
                value={form.project}
                onChange={(e) => update("project", e.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-gray-200 ps-3 pe-10 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              >
                <option value="">{t("allProjects")}</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </FormField>
        </div>
      </fieldset>

      {failure && (
        <div className="px-6 pb-4">
          <ApiFailureNotice failure={failure} />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
        <button
          type="button"
          onClick={close}
          disabled={pending}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={!canSave || pending}
          title={canSave ? undefined : tUnits("notAvailableYet")}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("saveDraft")}
        </button>
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={!canSave || pending}
          title={canSave ? undefined : tUnits("notAvailableYet")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("publishEvent")}
        </button>
      </div>
    </ModalWrapper>
  );
}
