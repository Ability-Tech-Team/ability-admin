"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import type { ProjectOption } from "@/src/services/projects";
import {
  OWNERSHIP_OWNER,
  OWNERSHIP_RENTER,
  type AssignUnitInput,
} from "@/src/services/unitAssignments";
import { CUSTOMER_SEARCH_MIN, useCustomerSearch } from "../hooks/useCustomerSearch";
import type { AssignFormError, AssignFormErrors, AssignFormValues } from "../types";
import { emptyAssignForm, todayIso, validateAssignForm } from "../utils";

type Props = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** Active projects to assign in. */
  projects: ProjectOption[];
  /** Why the projects couldn't load. */
  projectsFailure: ApiFailure | null;
  /** The project the list is filtered by, picked to start with. */
  initialProjectId: number | undefined;
  pending: boolean;
  failure: ApiFailure | null;
  onClose: () => void;
  onSubmit: (input: AssignUnitInput) => void;
};

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors";
const invalidClass = "border-red-300";
const labelClass = "mb-1 block text-[11px] font-medium text-gray-700";

/** Assigning a unit, found by its number in the project, to one of the project's customers. */
export default function AssignUnitModal({
  apiBaseUrl,
  portalBaseUrl,
  projects,
  projectsFailure,
  initialProjectId,
  pending,
  failure,
  onClose,
  onSubmit,
}: Props) {
  const t = useTranslations("MasterData");
  const tScreen = useTranslations("UnitAssignmentScreen");
  const id = useId();
  const [values, setValues] = useState<AssignFormValues>(() =>
    emptyAssignForm(
      initialProjectId !== undefined && projects.some((project) => project.id === initialProjectId)
        ? String(initialProjectId)
        : "",
      todayIso(),
    ),
  );
  const [errors, setErrors] = useState<AssignFormErrors>({});
  const [customerQuery, setCustomerQuery] = useState("");

  const projectId = values.projectId ? Number(values.projectId) : null;
  const customers = useCustomerSearch({ apiBaseUrl, portalBaseUrl, projectId, name: customerQuery });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function close() {
    if (!pending) onClose();
  }

  function set<K extends keyof AssignFormValues>(field: K, value: AssignFormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    const result = validateAssignForm(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(result.input);
  }

  const errorText = (error: AssignFormError | undefined) =>
    error ? <p className="mt-1 text-[10px] text-red-600">{tScreen(`errors.${error}`)}</p> : null;

  const searching = projectId !== null && customerQuery.trim().length >= CUSTOMER_SEARCH_MIN;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" onClick={close} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={close}>
        <form
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-title`}
          noValidate
          onSubmit={submit}
          onKeyDown={(event) => event.key === "Escape" && close()}
          className="w-[520px] max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 id={`${id}-title`} className="text-[15px] font-bold text-gray-900">{t("addAssignment")}</h2>
            <button
              type="button"
              onClick={close}
              aria-label={tScreen("close")}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <fieldset disabled={pending} className="grid grid-cols-2 gap-x-4 gap-y-4 px-6">
            {projectsFailure && (
              <div className="col-span-2">
                <ApiFailureNotice failure={projectsFailure} messages={{ forbidden: tScreen("projectsForbidden") }} />
              </div>
            )}

            {/* Project */}
            <div>
              <label htmlFor={`${id}-project`} className={labelClass}>
                {t("formFields.project")} <span className="text-red-500">*</span>
              </label>
              <select
                id={`${id}-project`}
                value={values.projectId}
                onChange={(e) => {
                  // Customers are listed per project: a new project starts the pick again.
                  setValues((previous) => ({ ...previous, projectId: e.target.value, customer: null }));
                  setCustomerQuery("");
                }}
                aria-invalid={Boolean(errors.projectId)}
                className={`${inputClass} ${errors.projectId ? invalidClass : ""}`}
              >
                <option value="">{tScreen("selectProject")}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {errorText(errors.projectId)}
            </div>

            {/* Unit Number */}
            <div>
              <label htmlFor={`${id}-unit`} className={labelClass}>
                {t("columns.unitNumber")} <span className="text-red-500">*</span>
              </label>
              <input
                id={`${id}-unit`}
                type="text"
                value={values.unitNumber}
                onChange={(e) => set("unitNumber", e.target.value)}
                aria-invalid={Boolean(errors.unitNumber)}
                className={`${inputClass} ${errors.unitNumber ? invalidClass : ""}`}
              />
              {errorText(errors.unitNumber)}
            </div>

            {/* Customer */}
            <div className="col-span-2">
              <label htmlFor={`${id}-customer`} className={labelClass}>
                {t("columns.customer")} <span className="text-red-500">*</span>
              </label>
              {values.customer ? (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900">{values.customer.name}</p>
                    <p className="text-[10px] text-gray-400" dir="ltr">
                      {values.customer.idNumber}
                      {values.customer.mobileNumber && ` · ${values.customer.mobileNumber}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("customer", null)}
                    className="text-[11px] font-medium text-blue-600 hover:underline"
                  >
                    {tScreen("changeCustomer")}
                  </button>
                </div>
              ) : (
                <>
                  <input
                    id={`${id}-customer`}
                    type="search"
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    disabled={projectId === null}
                    placeholder={projectId === null ? tScreen("pickProjectFirst") : tScreen("customerSearchPlaceholder")}
                    aria-invalid={Boolean(errors.customer)}
                    className={`${inputClass} disabled:bg-gray-50 ${errors.customer ? invalidClass : ""}`}
                  />
                  {searching && (
                    <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-gray-100">
                      {customers.failure ? (
                        <div className="p-2">
                          <ApiFailureNotice failure={customers.failure} onRetry={customers.reload} />
                        </div>
                      ) : customers.loading && !customers.data ? (
                        <p className="px-3 py-2 text-[11px] text-gray-400">{tScreen("searching")}</p>
                      ) : customers.data && customers.data.length === 0 ? (
                        <p className="px-3 py-2 text-[11px] text-gray-400">{tScreen("noCustomers")}</p>
                      ) : (
                        <ul className={customers.loading ? "opacity-60" : undefined}>
                          {(customers.data ?? []).map((customer) => (
                            <li key={customer.id}>
                              <button
                                type="button"
                                onClick={() => set("customer", customer)}
                                className="flex w-full flex-col items-start px-3 py-2 text-start hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                              >
                                <span className="text-[12px] text-gray-900">{customer.name}</span>
                                <span className="text-[10px] text-gray-400" dir="ltr">
                                  {customer.idNumber}
                                  {customer.mobileNumber && ` · ${customer.mobileNumber}`}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}
              {errorText(errors.customer)}
            </div>

            {/* Occupancy Type */}
            <div>
              <label htmlFor={`${id}-ownership`} className={labelClass}>
                {t("columns.occupancyType")} <span className="text-red-500">*</span>
              </label>
              <select
                id={`${id}-ownership`}
                value={values.ownershipId}
                onChange={(e) => set("ownershipId", Number(e.target.value) === OWNERSHIP_RENTER ? OWNERSHIP_RENTER : OWNERSHIP_OWNER)}
                className={inputClass}
              >
                <option value={OWNERSHIP_OWNER}>{t("customerTypes.owner")}</option>
                <option value={OWNERSHIP_RENTER}>{t("customerTypes.tenant")}</option>
              </select>
            </div>

            {/* Contract Number */}
            <div>
              <label htmlFor={`${id}-contract`} className={labelClass}>
                {tScreen("contractNumber")} <span className="text-red-500">*</span>
              </label>
              <input
                id={`${id}-contract`}
                type="text"
                value={values.contractNumber}
                onChange={(e) => set("contractNumber", e.target.value)}
                aria-invalid={Boolean(errors.contractNumber)}
                className={`${inputClass} ${errors.contractNumber ? invalidClass : ""}`}
              />
              {errorText(errors.contractNumber)}
            </div>

            {/* Dates */}
            <div>
              <label htmlFor={`${id}-sign`} className={labelClass}>
                {tScreen("signDate")} <span className="text-red-500">*</span>
              </label>
              <input
                id={`${id}-sign`}
                type="date"
                value={values.signDate}
                onChange={(e) => set("signDate", e.target.value)}
                aria-invalid={Boolean(errors.signDate)}
                className={`${inputClass} ${errors.signDate ? invalidClass : ""}`}
              />
              {errorText(errors.signDate)}
            </div>
            <div>
              <label htmlFor={`${id}-start`} className={labelClass}>
                {t("columns.startDate")} <span className="text-red-500">*</span>
              </label>
              <input
                id={`${id}-start`}
                type="date"
                value={values.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                aria-invalid={Boolean(errors.startDate)}
                className={`${inputClass} ${errors.startDate ? invalidClass : ""}`}
              />
              {errorText(errors.startDate)}
            </div>
            <div className="col-span-2">
              <label htmlFor={`${id}-end`} className={labelClass}>
                {tScreen("endDate")}
              </label>
              <input
                id={`${id}-end`}
                type="date"
                value={values.endDate}
                min={values.startDate || undefined}
                onChange={(e) => set("endDate", e.target.value)}
                aria-invalid={Boolean(errors.endDate)}
                aria-describedby={`${id}-end-hint`}
                className={`${inputClass} ${errors.endDate ? invalidClass : ""}`}
              />
              <p id={`${id}-end-hint`} className="mt-1 text-[10px] text-gray-400">{tScreen("endDateHint")}</p>
              {errorText(errors.endDate)}
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
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? tScreen("saving") : tScreen("assign")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
