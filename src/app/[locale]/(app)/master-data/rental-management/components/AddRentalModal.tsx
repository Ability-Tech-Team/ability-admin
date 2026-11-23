"use client";

import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { ID_TYPE } from "@/src/services/rentals";
import { useAddRental } from "../hooks/useAddRental";
import type { ProjectOption } from "@/src/services/projects";

type Props = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  projects: ProjectOption[] | null;
  projectsUnavailable: boolean;
  onSaved: () => void;
  onClose: () => void;
};

const input =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors disabled:bg-gray-50";

export default function AddRentalModal({ apiBaseUrl, portalBaseUrl, projects, projectsUnavailable, onSaved, onClose }: Props) {
  const t = useTranslations("MasterData");
  const tRentals = useTranslations("RentalsScreen");
  const form = useAddRental({ apiBaseUrl, portalBaseUrl, onSaved });
  const { values, set } = form;

  const save = async (addAnother: boolean) => {
    const saved = await form.submit(addAnother);
    if (saved && !addAnother) onClose();
  };

  return (
    <ModalWrapper onClose={onClose} width="max-w-[520px]" labelledBy="add-rental-title">
      <form
        key={form.formKey}
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          void save(false);
        }}
      >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 id="add-rental-title" className="text-[15px] font-bold text-gray-900">{t("addRentalModal.title")}</h2>
            <CloseButton onClick={onClose} label={tRentals("detail.close")} />
          </div>

          {/* Fields */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-x-4 gap-y-4 overflow-y-auto px-6 sm:grid-cols-2">
            {/* Project */}
            <FormField label={t("formFields.project")} required>
              <select
                value={values.projectId ?? ""}
                disabled={projectsUnavailable}
                onChange={(event) => set("projectId", event.target.value ? Number(event.target.value) : null)}
                className={`${input} bg-white`}
              >
                <option value="">{tRentals("add.chooseProject")}</option>
                {(projects ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {projectsUnavailable && <p className="mt-1 text-[11px] text-amber-700">{tRentals("projectsUnavailable")}</p>}
            </FormField>

            {/* Unit: the project's units that can be rented now */}
            <div>
              <FormField label={t("addRentalModal.unit")} required>
                <select
                  value={values.unitId ?? ""}
                  disabled={values.projectId === null || form.unitsLoading}
                  onChange={(event) => set("unitId", event.target.value ? Number(event.target.value) : null)}
                  className={`${input} bg-white`}
                >
                  <option value="">
                    {form.unitsLoading ? tRentals("add.unitsLoading") : tRentals("add.chooseUnit")}
                  </option>
                  {form.units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {[unit.unitNumber, unit.unitTypeName].filter(Boolean).join(" · ")}
                    </option>
                  ))}
                </select>
                {form.unitsLoaded && form.units.length === 0 && (
                  <p className="mt-1 text-[11px] text-amber-700">{tRentals("add.noUnits")}</p>
                )}
              </FormField>
              {form.unitsFailure && <ApiFailureNotice className="mt-1" failure={form.unitsFailure} />}
            </div>

            {/* Tenant Name */}
            <FormField label={t("addRentalModal.tenantName")} required>
              <input
                type="text"
                value={values.customerName}
                onChange={(event) => set("customerName", event.target.value)}
                className={input}
              />
            </FormField>

            {/* Mobile */}
            <FormField label={t("formFields.mobileNumber")}>
              <input
                type="tel"
                dir="ltr"
                value={values.mobileNumber}
                onChange={(event) => set("mobileNumber", event.target.value)}
                className={input}
              />
            </FormField>

            {/* ID / Passport Type */}
            <FormField label={t("addRentalModal.idPassportType")} required>
              <select
                value={values.idType}
                onChange={(event) =>
                  set("idType", Number(event.target.value) === ID_TYPE.PASSPORT ? ID_TYPE.PASSPORT : ID_TYPE.NATIONAL_ID)
                }
                className={`${input} bg-white`}
              >
                <option value={ID_TYPE.NATIONAL_ID}>{tRentals("idTypes.2")}</option>
                <option value={ID_TYPE.PASSPORT}>{tRentals("idTypes.1")}</option>
              </select>
            </FormField>

            {/* ID / Passport Number */}
            <FormField label={t("addRentalModal.idPassportNumber")} required>
              <input
                type="text"
                minLength={8}
                maxLength={14}
                value={values.idNumber}
                onChange={(event) => set("idNumber", event.target.value)}
                className={input}
              />
            </FormField>

            {/* Start Date */}
            <FormField label={t("addRentalModal.startDate")} required>
              <input
                type="date"
                value={values.startDate}
                onChange={(event) => set("startDate", event.target.value)}
                className={input}
              />
            </FormField>

            {/* End Date */}
            <FormField label={t("addRentalModal.endDate")} required>
              <input
                type="date"
                value={values.endDate}
                onChange={(event) => set("endDate", event.target.value)}
                className={input}
              />
            </FormField>

            {/* Tenant Attachments */}
            <div className="sm:col-span-2">
              <FormField label={t("addRentalModal.tenantAttachments")}>
                <input
                  type="file"
                  multiple
                  onChange={(event) => set("files", Array.from(event.target.files ?? []))}
                  className="w-full text-[12px] text-gray-700 file:me-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 hover:file:bg-gray-50"
                />
              </FormField>
            </div>
          </div>

          <div className="flex flex-col gap-2 px-6 pt-4" aria-live="polite">
            {form.problem && (
              <p role="alert" className="text-[12px] text-red-600">
                {tRentals(`add.problems.${form.problem}`)}
              </p>
            )}
            {form.saveFailure && <ApiFailureNotice failure={form.saveFailure} />}
            {form.savedCount > 0 && !form.problem && !form.saveFailure && (
              <p className="text-[12px] text-green-700">{tRentals("add.saved", { count: form.savedCount })}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-end gap-3 px-6 pt-4 pb-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              disabled={form.saving}
              onClick={() => void save(true)}
              className="rounded-lg border border-blue-600 px-4 py-2 text-[12px] font-medium text-blue-600 hover:bg-blue-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("addRentalModal.saveAndAddAnother")}
            </button>
            <button
              type="submit"
              disabled={form.saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {form.saving ? tRentals("dialogs.sending") : t("addRentalModal.submit")}
            </button>
          </div>
      </form>
    </ModalWrapper>
  );
}
