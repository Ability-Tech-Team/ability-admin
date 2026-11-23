"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import ModalWrapper from "@/src/components/ModalWrapper";
import type { ApiFailure } from "@/src/lib/apiFailure";
import {
  PROJECT_TYPES,
  isProjectType,
  type Project,
  type ProjectInput,
} from "@/src/services/projects";
import type { ProjectFormError, ProjectFormErrors, ProjectFormValues } from "../types";
import {
  PROJECT_TYPE_LABEL_KEYS,
  emptyProjectForm,
  projectToForm,
  validateProjectForm,
} from "../utils";

type Props =
  | {
      mode: "create";
      project: null;
      pending: boolean;
      failure: ApiFailure | null;
      onClose: () => void;
      onSubmit: (input: ProjectInput & { projectCode: string }) => void;
    }
  | {
      mode: "edit";
      project: Project;
      pending: boolean;
      failure: ApiFailure | null;
      onClose: () => void;
      onSubmit: (input: ProjectInput) => void;
    };

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors disabled:bg-gray-50 disabled:text-gray-500";
const invalidClass = "border-red-300";

/** Adding a project, or editing one. Only the fields the API saves are here. */
export default function ProjectFormModal(props: Props) {
  const { mode, project, pending, failure, onClose } = props;
  const t = useTranslations("MasterData");
  const tScreen = useTranslations("ProjectsScreen");
  const [values, setValues] = useState<ProjectFormValues>(() =>
    project ? projectToForm(project) : emptyProjectForm(),
  );
  const [errors, setErrors] = useState<ProjectFormErrors>({});

  function close() {
    if (!pending) onClose();
  }

  function set<K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  function setCorner(index: number, value: string) {
    setValues((previous) => {
      const boundary = [...previous.boundary] as ProjectFormValues["boundary"];
      boundary[index] = value;
      return { ...previous, boundary };
    });
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    const result = validateProjectForm(values, mode);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    if (props.mode === "create") props.onSubmit(result.input);
    else props.onSubmit(result.input);
  }

  const errorText = (error: ProjectFormError | undefined) =>
    error ? <p className="mt-1 text-[10px] text-red-600">{tScreen(`errors.${error}`)}</p> : null;

  // The API can't clear a type once set (form-data carries no null), so "not set" is offered
  // only while the project has none.
  const canLeaveTypeUnset = !project || !isProjectType(project.type);

  return (
    <ModalWrapper onClose={close} width="max-w-[520px]" labelledBy="project-form-title">
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 id="project-form-title" className="text-[15px] font-bold text-gray-900">
              {mode === "create" ? t("addProjectModal.title") : t("editProject.title")}
            </h2>
            <CloseButton onClick={close} label={t("cancel")} />
          </div>

          {/* Fields */}
          <fieldset disabled={pending} className="grid min-h-0 grid-cols-2 gap-x-4 gap-y-4 px-6 overflow-y-auto flex-1">
            {/* Project Name (EN) */}
            <div>
              <FormField label={t("editProject.nameEn")} required>
                <input
                  type="text"
                  value={values.enName}
                  onChange={(e) => set("enName", e.target.value)}
                  placeholder={t("addProjectModal.nameEnPlaceholder")}
                  aria-invalid={Boolean(errors.enName)}
                  className={`${inputClass} ${errors.enName ? invalidClass : ""}`}
                />
              </FormField>
              {errorText(errors.enName)}
            </div>

            {/* Project Name (AR) */}
            <div>
              <FormField label={t("editProject.nameAr")} required>
                <input
                  type="text"
                  dir="rtl"
                  value={values.arName}
                  onChange={(e) => set("arName", e.target.value)}
                  placeholder={t("addProjectModal.nameArPlaceholder")}
                  aria-invalid={Boolean(errors.arName)}
                  className={`${inputClass} ${errors.arName ? invalidClass : ""}`}
                />
              </FormField>
              {errorText(errors.arName)}
            </div>

            {/* Company Code */}
            <div>
              <FormField label={tScreen("companyCode")} required>
                <input
                  type="text"
                  dir="ltr"
                  value={values.companyCode}
                  onChange={(e) => set("companyCode", e.target.value)}
                  aria-invalid={Boolean(errors.companyCode)}
                  className={`${inputClass} ${errors.companyCode ? invalidClass : ""}`}
                />
              </FormField>
              {errorText(errors.companyCode)}
            </div>

            {/* Project Code: fixed once created */}
            <div>
              <FormField label={tScreen("projectCode")} required={mode === "create"}>
                <input
                  type="text"
                  dir="ltr"
                  value={values.projectCode}
                  onChange={(e) => set("projectCode", e.target.value)}
                  readOnly={mode === "edit"}
                  disabled={mode === "edit"}
                  title={mode === "edit" ? tScreen("projectCodeFixed") : undefined}
                  aria-invalid={Boolean(errors.projectCode)}
                  className={`${inputClass} ${errors.projectCode ? invalidClass : ""}`}
                />
              </FormField>
              {errorText(errors.projectCode)}
            </div>

            {/* Type */}
            <div className="col-span-2">
              <FormField label={t("editProject.type")}>
                <select
                  value={values.type}
                  onChange={(e) => {
                    const next = e.target.value;
                    set("type", isProjectType(next) ? next : "");
                  }}
                  className={`${inputClass} bg-white`}
                >
                  {canLeaveTypeUnset && <option value="">{tScreen("typeNotSet")}</option>}
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(PROJECT_TYPE_LABEL_KEYS[type])}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Location */}
            <div className="col-span-2">
              <FormField label={t("editProject.location")}>
                <input
                  type="text"
                  value={values.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder={t("editProject.location")}
                  aria-invalid={Boolean(errors.location)}
                  className={`${inputClass} ${errors.location ? invalidClass : ""}`}
                />
              </FormField>
              {errorText(errors.location)}
            </div>

            {/* Google Maps Link */}
            <div className="col-span-2">
              <FormField label={t("editProject.googleMapsLink")}>
                <input
                  type="url"
                  dir="ltr"
                  value={values.googleMapsLink}
                  onChange={(e) => set("googleMapsLink", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  aria-invalid={Boolean(errors.googleMapsLink)}
                  className={`${inputClass} ${errors.googleMapsLink ? invalidClass : ""}`}
                />
              </FormField>
              {errorText(errors.googleMapsLink)}
            </div>

            {/* Google Maps Boundary — 4 Points */}
            <div className="col-span-2">
              <p className="mb-2 text-[11px] font-semibold text-gray-900">
                {t("editProject.boundaryTitle")}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {values.boundary.map((corner, index) => (
                  <div key={index}>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-medium text-gray-500">
                        {t(`editProject.point${index + 1}`)}
                      </span>
                      <input
                        type="text"
                        dir="ltr"
                        inputMode="decimal"
                        value={corner}
                        onChange={(e) => setCorner(index, e.target.value)}
                        placeholder="30.0444, 31.2357"
                        aria-invalid={Boolean(errors.points?.[index])}
                        className={`${inputClass} ${errors.points?.[index] ? invalidClass : ""}`}
                      />
                    </label>
                    {errorText(errors.points?.[index])}
                  </div>
                ))}
              </div>
              {errorText(errors.boundary)}
            </div>

            {/* Project Manager */}
            <div className="col-span-2">
              <FormField label={t("editProject.manager")}>
                <input
                  type="text"
                  value={values.managerName}
                  onChange={(e) => set("managerName", e.target.value)}
                  placeholder={t("addProjectModal.managerPlaceholder")}
                  aria-invalid={Boolean(errors.managerName)}
                  className={`${inputClass} ${errors.managerName ? invalidClass : ""}`}
                />
              </FormField>
              {errorText(errors.managerName)}
            </div>
          </fieldset>

          {failure && (
            <div className="px-6 pt-4">
              <ApiFailureNotice failure={failure} messages={{ forbidden: tScreen("forbidden") }} />
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
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? tScreen("saving") : mode === "create" ? t("addProjectModal.submit") : t("saveChanges")}
            </button>
          </div>
      </form>
    </ModalWrapper>
  );
}
