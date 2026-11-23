"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import type { CustomerLookupField } from "../schema";
import type { CustomerFormField, CustomerFormValues, Named } from "../types";

type Variant = "add" | "edit";

type Props = {
  variant: Variant;
  values: CustomerFormValues;
  onChange: (field: CustomerFormField, value: string) => void;
  required: readonly CustomerFormField[];
  /** Required fields left empty after a save attempt. */
  missing: readonly CustomerFormField[];
  disabled?: boolean;
  /** The add form's project choice; left out when editing. */
  projects?: { options: Named[] | null; forbidden: boolean };
  /** The edit form's saved choices by name, shown in their disabled fields. */
  savedNames?: Partial<Record<CustomerLookupField, string | null>>;
};

const styles: Record<Variant, { label: string; input: string; file: string; grid: string }> = {
  add: {
    grid: "grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2",
    label: "mb-1 block text-[11px] font-medium text-gray-700",
    input:
      "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors disabled:bg-gray-50",
    file: "h-9 w-full text-[12px] text-gray-700 file:me-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50",
  },
  edit: {
    grid: "grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2",
    label: "mb-1 block text-[10px] font-medium text-gray-500",
    input:
      "w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] text-gray-900 outline-none focus:border-blue-400 transition-colors disabled:bg-gray-50",
    file: "w-full text-[12px] text-gray-500 file:me-3 file:rounded-lg file:border file:border-blue-200 file:bg-blue-50 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
  },
};

/** The customer's fields, shared by the add and edit forms. */
export default function CustomerFormFields({ variant, values, onChange, required, missing, disabled, projects, savedNames }: Props) {
  const t = useTranslations("MasterData");
  const tc = useTranslations("CustomersScreen");
  const prefix = useId();
  const style = styles[variant];
  const formFields = variant === "add" ? "addCustomerModal" : "formFields";

  function field(name: CustomerFormField, label: string, control: (id: string, className: string) => React.ReactNode) {
    const id = `${prefix}-${name}`;
    const isMissing = missing.includes(name);
    return (
      <div>
        <label htmlFor={id} className={style.label}>
          {label}
          {required.includes(name) && <span className="text-red-500 ms-0.5">*</span>}
        </label>
        {control(id, `${style.input} ${isMissing ? "border-red-300" : ""}`)}
        {isMissing && <p className="mt-0.5 text-[10px] text-red-600">{tc("requiredField")}</p>}
      </div>
    );
  }

  const text = (name: CustomerFormField, label: string, type: "text" | "email" | "tel" = "text") =>
    field(name, label, (id, className) => (
      <input
        id={id}
        type={type}
        value={values[name]}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        aria-invalid={missing.includes(name) || undefined}
        className={className}
      />
    ));

  // No admin route lists these choices, so they can't be changed here. Editing shows the saved
  // choice by its name (or its id), and a save leaves it as it is.
  const select = (name: CustomerLookupField, label: string) =>
    field(name, label, (id, className) => (
      <select
        id={id}
        value={values[name]}
        onChange={(e) => onChange(name, e.target.value)}
        disabled
        title={tc("notAvailable")}
        aria-invalid={missing.includes(name) || undefined}
        className={className}
      >
        <option value="">{tc("choose")}</option>
        {values[name] && <option value={values[name]}>{savedNames?.[name] ?? `#${values[name]}`}</option>}
      </select>
    ));

  return (
    <div className={style.grid}>
      {text("name", t(`${formFields}.customerName`))}
      {text("mobile", t(`${formFields}.mobileNumber`), "tel")}
      {text("email", t(`${formFields}.email`), "email")}
      {select("idTypeId", t(`${formFields}.idPassportType`))}
      {text("idNumber", t(`${formFields}.idPassportNumber`))}
      {select("countryId", t(`${formFields}.nationality`))}
      {projects &&
        field("projectId", t(`${formFields}.project`), (id, className) => (
          <>
            <select
              id={id}
              value={values.projectId}
              onChange={(e) => onChange("projectId", e.target.value)}
              disabled={disabled || !projects.options}
              aria-invalid={missing.includes("projectId") || undefined}
              className={className}
            >
              <option value="">{tc("chooseProject")}</option>
              {projects.options?.map((project) => (
                <option key={project.id} value={project.id}>{project.name ?? `#${project.id}`}</option>
              ))}
            </select>
            {projects.forbidden && <p className="mt-0.5 text-[10px] text-amber-700">{tc("projectsUnavailable")}</p>}
          </>
        ))}
      {select("customerTypeId", tc("fields.customerType"))}
      {select("maritalStatusId", tc("fields.maritalStatus"))}
      {select("religionId", tc("fields.religion"))}
      <div>
        <label htmlFor={`${prefix}-attachment`} className={style.label}>{t(`${formFields}.identityAttachment`)}</label>
        {/* The customer routes take JSON only; no admin route uploads a customer's file yet. */}
        <input id={`${prefix}-attachment`} type="file" disabled title={tc("notAvailable")} className={style.file} />
      </div>
    </div>
  );
}
