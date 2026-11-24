"use client";

import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import SelectWrapper from "@/src/components/SelectWrapper";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { useAddUnitForm } from "../hooks/useAddUnitForm";
import type { AddUnitProjects, UnitFormValues } from "../types";

type Props = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  projects: AddUnitProjects;
  /** The project the form starts on; "" for none. */
  initialProjectId: string;
  onCreated: () => void;
  onClose: () => void;
};

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors";
const selectClass = `${inputClass} appearance-none bg-white pe-10 disabled:bg-gray-50 disabled:text-gray-400`;
const invalidClass = "border-red-300";

/** The team's Add Unit form, on `CreateUnitDto` (`POST /projects/units`). */
export default function AddUnitModal({
  apiBaseUrl,
  portalBaseUrl,
  projects,
  initialProjectId,
  onCreated,
  onClose,
}: Props) {
  const t = useTranslations("MasterData");
  const tUnits = useTranslations("UnitsScreen");
  const form = useAddUnitForm({ apiBaseUrl, portalBaseUrl, initialProjectId, onCreated });
  const { values, errors, set } = form;

  const invalid = (field: keyof UnitFormValues) => (errors[field] ? invalidClass : "");
  const errorText = (field: keyof UnitFormValues) =>
    errors[field] ? <p className="mt-1 text-[10px] text-red-600">{tUnits(`errors.${errors[field]}`)}</p> : null;
  const noneDefined = (list: unknown[] | null) =>
    list && list.length === 0 ? <p className="mt-1 text-[10px] text-amber-700">{tUnits("form.noneDefined")}</p> : null;

  return (
    <ModalWrapper onClose={onClose} width="max-w-[520px]" labelledBy="add-unit-title">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h2 id="add-unit-title" className="text-[15px] font-bold text-gray-900">{t("addUnitModal.title")}</h2>
        <CloseButton onClick={onClose} label={tUnits("import.close")} />
      </div>

      <form
        noValidate
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          void form.submit();
        }}
      >
        {/* Fields */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <fieldset disabled={form.saving} className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-4 pb-1">
            {form.saveFailure && <ApiFailureNotice failure={form.saveFailure} className="col-span-2" />}
            {form.listsFailure && (
              <ApiFailureNotice failure={form.listsFailure} onRetry={form.reloadLists} className="col-span-2" />
            )}

            {/* Project */}
            <FormField label={t("addUnitModal.project")} required>
              <SelectWrapper>
                <select
                  value={values.projectId}
                  onChange={(event) => set("projectId", event.target.value)}
                  disabled={projects.locked || !projects.options}
                  aria-invalid={Boolean(errors.projectId)}
                  className={`${selectClass} ${invalid("projectId")}`}
                >
                  {!projects.locked && <option value="">{tUnits("form.chooseProject")}</option>}
                  {(projects.options ?? []).map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </SelectWrapper>
              {projects.unavailable && (
                <p className="mt-1 text-[10px] text-amber-700">{tUnits("projectsUnavailable")}</p>
              )}
              {errorText("projectId")}
            </FormField>

            {/* Building */}
            <FormField label={t("addUnitModal.building")}>
              <SelectWrapper>
                <select
                  value={values.subProjectId}
                  onChange={(event) => set("subProjectId", event.target.value)}
                  disabled={!form.buildings}
                  className={selectClass}
                >
                  <option value="">{tUnits("form.noBuilding")}</option>
                  {(form.buildings ?? []).map((building) => (
                    <option key={building.id} value={building.id}>{building.name}</option>
                  ))}
                </select>
              </SelectWrapper>
            </FormField>

            {/* Unit Number */}
            <FormField label={t("addUnitModal.unitNumber")} required>
              <input
                type="text"
                placeholder="301"
                value={values.unitNumber}
                onChange={(event) => set("unitNumber", event.target.value)}
                aria-invalid={Boolean(errors.unitNumber)}
                className={`${inputClass} ${invalid("unitNumber")}`}
              />
              {errorText("unitNumber")}
            </FormField>

            {/* Floor */}
            <FormField label={t("addUnitModal.floor")}>
              <input
                type="text"
                inputMode="numeric"
                value={values.floor}
                onChange={(event) => set("floor", event.target.value)}
                aria-invalid={Boolean(errors.floor)}
                className={`${inputClass} ${invalid("floor")}`}
              />
              {errorText("floor")}
            </FormField>

            {/* Unit Type */}
            <FormField label={t("addUnitModal.unitType")} required>
              <SelectWrapper>
                <select
                  value={values.unitTypeId}
                  onChange={(event) => set("unitTypeId", event.target.value)}
                  disabled={!form.unitTypes}
                  aria-invalid={Boolean(errors.unitTypeId)}
                  className={`${selectClass} ${invalid("unitTypeId")}`}
                >
                  <option value="">{tUnits("form.choose")}</option>
                  {(form.unitTypes ?? []).map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </SelectWrapper>
              {noneDefined(form.unitTypes)}
              {errorText("unitTypeId")}
            </FormField>

            {/* Location */}
            <FormField label={tUnits("form.location")} required>
              <SelectWrapper>
                <select
                  value={values.locationId}
                  onChange={(event) => set("locationId", event.target.value)}
                  disabled={!form.locations}
                  aria-invalid={Boolean(errors.locationId)}
                  className={`${selectClass} ${invalid("locationId")}`}
                >
                  <option value="">{tUnits("form.choose")}</option>
                  {(form.locations ?? []).map((location) => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </SelectWrapper>
              {noneDefined(form.locations)}
              {errorText("locationId")}
            </FormField>

            {/* Total Area */}
            <FormField label={tUnits("form.totalArea")} required>
              <input
                type="text"
                inputMode="decimal"
                value={values.totalArea}
                onChange={(event) => set("totalArea", event.target.value)}
                aria-invalid={Boolean(errors.totalArea)}
                className={`${inputClass} ${invalid("totalArea")}`}
              />
              {errorText("totalArea")}
            </FormField>
          </fieldset>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pt-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={form.saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:cursor-wait disabled:opacity-60"
          >
            {t("addUnitModal.submit")}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
