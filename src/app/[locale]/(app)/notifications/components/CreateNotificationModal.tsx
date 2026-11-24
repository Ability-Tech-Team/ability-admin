"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import type { ProjectOption } from "@/src/services/projects";
import {
  NOTIFICATION_IMAGE_EXTENSIONS,
  NOTIFICATION_IMAGE_MAX_MB,
  NOTIFICATION_TARGETS,
  type NotificationTarget,
  type SendNotificationInput,
} from "@/src/services/notifications";
import type { NotificationFormError, NotificationFormErrors, NotificationFormValues } from "../types";
import { checkNotificationImage, emptyNotificationForm, validateNotificationForm } from "../utils";

type Props = {
  /** Active projects; null until they load. */
  projects: ProjectOption[] | null;
  projectsLoading: boolean;
  /** The employee's projects; none to pick when the list can't load. */
  projectsFailure: ApiFailure | null;
  onRetryProjects: () => void;
  pending: boolean;
  failure: ApiFailure | null;
  onClose: () => void;
  onSubmit: (input: SendNotificationInput) => void;
};

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors";
const textareaClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none";
const invalidClass = "border-red-300";

const TARGET_LABEL_KEYS: Record<NotificationTarget, string> = {
  customers: "targets.customers",
  guests: "targets.guests",
  all: "targets.all",
};

/** Sends an announcement to a project's customers, guests, or both, right away. */
export default function CreateNotificationModal({
  projects,
  projectsLoading,
  projectsFailure,
  onRetryProjects,
  pending,
  failure,
  onClose,
  onSubmit,
}: Props) {
  const t = useTranslations("Notifications");
  const tScreen = useTranslations("NotificationsScreen");
  const id = useId();
  const [values, setValues] = useState<NotificationFormValues>(emptyNotificationForm);
  const [errors, setErrors] = useState<NotificationFormErrors>({});

  function close() {
    if (!pending) onClose();
  }

  function set<K extends keyof NotificationFormValues>(field: K, value: NotificationFormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  function pickImage(file: File | null) {
    set("image", file);
    const problem = file ? checkNotificationImage(file) : null;
    setErrors((previous) => ({ ...previous, image: problem ?? undefined }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    const result = validateNotificationForm(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(result.input);
  }

  const errorText = (error: NotificationFormError | undefined) =>
    error ? (
      <p className="mt-1 text-[10px] text-red-600">
        {tScreen(`errors.${error}`, { max: NOTIFICATION_IMAGE_MAX_MB })}
      </p>
    ) : null;

  return (
    <ModalWrapper onClose={close} width="max-w-[580px]" labelledBy="create-notification-title">
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 id="create-notification-title" className="text-[15px] font-bold text-gray-900">{t("createModal.title")}</h2>
          <CloseButton onClick={close} label={t("createModal.cancel")} />
        </div>

        {/* Fields */}
        <fieldset disabled={pending} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6">
          {/* Title EN + AR */}
          <div className="grid grid-cols-2 gap-x-4">
            <div>
              <FormField label={t("createModal.titleEn")} required>
                <input
                  type="text"
                  dir="ltr"
                  value={values.enTitle}
                  onChange={(e) => set("enTitle", e.target.value)}
                  placeholder={t("createModal.titleEnPlaceholder")}
                  aria-invalid={Boolean(errors.enTitle)}
                  className={`${inputClass} ${errors.enTitle ? invalidClass : ""}`}
                />
              </FormField>
              {errorText(errors.enTitle)}
            </div>
            <div>
              <FormField label={t("createModal.titleAr")} required>
                <input
                  type="text"
                  dir="rtl"
                  value={values.arTitle}
                  onChange={(e) => set("arTitle", e.target.value)}
                  placeholder={t("createModal.titleArPlaceholder")}
                  aria-invalid={Boolean(errors.arTitle)}
                  className={`${inputClass} ${errors.arTitle ? invalidClass : ""}`}
                />
              </FormField>
              {errorText(errors.arTitle)}
            </div>
          </div>

          {/* Body (English) */}
          <div>
            <FormField label={t("createModal.bodyEn")} required>
              <textarea
                rows={3}
                dir="ltr"
                value={values.enBody}
                onChange={(e) => set("enBody", e.target.value)}
                placeholder={t("createModal.bodyEnPlaceholder")}
                aria-invalid={Boolean(errors.enBody)}
                className={`${textareaClass} ${errors.enBody ? invalidClass : ""}`}
              />
            </FormField>
            {errorText(errors.enBody)}
          </div>

          {/* Body (Arabic) */}
          <div>
            <FormField label={t("createModal.bodyAr")} required>
              <textarea
                rows={3}
                dir="rtl"
                value={values.arBody}
                onChange={(e) => set("arBody", e.target.value)}
                placeholder={t("createModal.bodyArPlaceholder")}
                aria-invalid={Boolean(errors.arBody)}
                className={`${textareaClass} ${errors.arBody ? invalidClass : ""}`}
              />
            </FormField>
            {errorText(errors.arBody)}
          </div>

          {/* Project + Target Audience */}
          <div className="grid grid-cols-2 gap-x-4">
            <div>
              <FormField label={t("createModal.project")} required>
                <select
                  value={values.projectId}
                  onChange={(e) => set("projectId", e.target.value)}
                  disabled={!projects}
                  aria-invalid={Boolean(errors.projectId)}
                  className={`${inputClass} disabled:bg-gray-50 ${errors.projectId ? invalidClass : ""}`}
                >
                  <option value="">
                    {projectsLoading && !projects ? tScreen("loadingProjects") : tScreen("selectProject")}
                  </option>
                  {(projects ?? []).map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </FormField>
              {errorText(errors.projectId)}
            </div>
            <div>
              <FormField label={t("createModal.targetAudience")}>
                <select
                  value={values.target}
                  onChange={(e) => {
                    const target = NOTIFICATION_TARGETS.find((option) => option === e.target.value);
                    if (target) set("target", target);
                  }}
                  className={inputClass}
                >
                  {NOTIFICATION_TARGETS.map((target) => (
                    <option key={target} value={target}>{tScreen(TARGET_LABEL_KEYS[target])}</option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>

          {projectsFailure && (
            <ApiFailureNotice
              failure={projectsFailure}
              onRetry={onRetryProjects}
              messages={{ forbidden: tScreen("projectsForbidden") }}
            />
          )}

          {/* Image */}
          <div>
            <FormField label={tScreen("image")}>
              <input
                type="file"
                accept={NOTIFICATION_IMAGE_EXTENSIONS.join(",")}
                onChange={(e) => pickImage(e.target.files?.[0] ?? null)}
                aria-invalid={Boolean(errors.image)}
                aria-describedby={`${id}-image-hint`}
                className="block w-full text-[11px] text-gray-600 file:me-3 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-2.5 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 hover:file:bg-gray-50"
              />
            </FormField>
            <p id={`${id}-image-hint`} className="mt-1 text-[10px] text-gray-400">
              {tScreen("imageHint", { max: NOTIFICATION_IMAGE_MAX_MB })}
            </p>
            {errorText(errors.image)}
          </div>
        </fieldset>

        {failure && (
          <div className="px-6 pt-4">
            <ApiFailureNotice failure={failure} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pt-5 pb-5">
          <button
            type="button"
            onClick={close}
            disabled={pending}
            className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t("createModal.cancel")}
          </button>
          {/* No route saves a draft. */}
          <button
            type="button"
            disabled
            title={tScreen("notAvailableYet")}
            className="rounded-lg border border-blue-600 px-4 py-2 text-[12px] font-medium text-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("createModal.saveDraft")}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? tScreen("sending") : t("createModal.sendNow")}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
