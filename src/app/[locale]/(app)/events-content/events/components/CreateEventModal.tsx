"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import SelectWrapper from "@/src/components/SelectWrapper";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import type { ApiFailure } from "@/src/lib/apiFailure";
import {
  ALL_PROJECTS_ID,
  EVENT_IMAGE_EXTENSIONS,
  EVENT_IMAGE_MAX_MB,
  type CommunityEvent,
} from "@/src/services/events";
import type { EventFormError, EventFormErrors, EventFormValues } from "../types";
import { emptyEventForm, eventToForm, validateEventForm } from "../utils";

type Props = {
  /** The event being edited, or null for a new one. */
  event: CommunityEvent | null;
  projectOptions: { value: string; label: string }[];
  pending: boolean;
  failure: ApiFailure | null;
  onClose: () => void;
  /** Save Draft saves it unpublished, Publish Event published. */
  onSubmit: (values: EventFormValues, published: boolean) => void;
  /** Asks to delete the event; left out for a new one. */
  onDelete?: () => void;
};

const ERROR_KEYS: Record<EventFormError, string> = {
  required: "ProjectsScreen.errors.required",
  tooLong: "ProjectsScreen.errors.tooLong",
  capacity: "EventsScreen.errors.capacity",
  invalidUrl: "ProjectsScreen.errors.invalidUrl",
  imageType: "EventsScreen.errors.imageType",
  imageTooLarge: "EventsScreen.errors.imageTooLarge",
};

export default function CreateEventModal({ event, projectOptions, pending, failure, onClose, onSubmit, onDelete }: Props) {
  const t = useTranslations("EventsContent.createModal");
  const tScreen = useTranslations("EventsScreen");
  const tDelete = useTranslations("EventsContent.deleteDialog");
  const tAll = useTranslations();
  const locale = useLocale();
  const imageId = useId();
  const [form, setForm] = useState<EventFormValues>(() =>
    event ? eventToForm(event, locale) : emptyEventForm(),
  );
  const [errors, setErrors] = useState<EventFormErrors>({});

  // The event's own project, even when the project list couldn't load.
  const options =
    event && event.projectId !== ALL_PROJECTS_ID && !projectOptions.some((opt) => opt.value === String(event.projectId))
      ? [{ value: String(event.projectId), label: event.projectName }, ...projectOptions]
      : projectOptions;

  function update<K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function close() {
    if (!pending) onClose();
  }

  function submit(published: boolean) {
    if (pending) return;
    const found = validateEventForm(form, event);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit(form, published);
  }

  const errorText = (field: keyof EventFormValues) =>
    errors[field] ? (
      <span className="mt-1 block text-[10px] text-red-600">
        {tAll(ERROR_KEYS[errors[field]] as Parameters<typeof tAll>[0], { max: EVENT_IMAGE_MAX_MB })}
      </span>
    ) : null;

  const invalid = (field: keyof EventFormValues) => (errors[field] ? "border-red-300" : "border-gray-200");

  return (
    <ModalWrapper onClose={close} width="max-w-[560px]" labelledBy="event-form-title">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 id="event-form-title" className="text-[15px] font-bold text-gray-900">
          {event ? tScreen("editTitle") : t("title")}
        </h2>
        <CloseButton onClick={close} />
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
      <fieldset disabled={pending} className="flex min-w-0 flex-col gap-4 px-6 py-5">
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

        {/* Ticketing link */}
        <FormField label={tScreen("ticketingUrl")} required={!event || Boolean(event.ticketingUrl)}>
          <input
            type="url"
            dir="ltr"
            value={form.ticketingUrl}
            onChange={(e) => update("ticketingUrl", e.target.value)}
            placeholder="https://"
            aria-invalid={Boolean(errors.ticketingUrl)}
            className={`h-9 w-full rounded-lg border ${invalid("ticketingUrl")} px-3 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
          />
          {errorText("ticketingUrl")}
        </FormField>

        {/* Image */}
        <div>
          <label htmlFor={imageId} className="mb-1 block text-[11px] font-medium text-gray-700">
            {tScreen("image")}
            {!event && <span className="text-red-500"> *</span>}
          </label>
          <input
            id={imageId}
            type="file"
            accept={EVENT_IMAGE_EXTENSIONS.join(",")}
            onChange={(e) => update("image", e.target.files?.[0] ?? null)}
            aria-invalid={Boolean(errors.image)}
            aria-describedby={`${imageId}-hint`}
            className="block w-full text-[11px] text-gray-600 file:me-3 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-2.5 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 hover:file:bg-gray-50"
          />
          <p id={`${imageId}-hint`} className="mt-1 text-[10px] text-gray-400">
            {tScreen(event ? "imageHintEdit" : "imageHint", { max: EVENT_IMAGE_MAX_MB })}
          </p>
          {errorText("image")}
        </div>
      </fieldset>
      </div>

      {failure && (
        <div className="px-6 pb-4">
          <ApiFailureNotice failure={failure} />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="me-auto rounded-lg bg-red-600 px-4 py-2 text-[11px] font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {tDelete("delete")}
          </button>
        )}
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
          disabled={pending}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("saveDraft")}
        </button>
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("publishEvent")}
        </button>
      </div>
    </ModalWrapper>
  );
}
