"use client";

import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { useAddFamilyMember } from "../hooks/useAddFamilyMember";
import type { RelativeFormErrors } from "../utils";

type Props = {
  form: ReturnType<typeof useAddFamilyMember>;
  onClose: () => void;
};

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors disabled:bg-gray-50";
const invalidClass = "border-red-300";

/** Adds a relative to an owner's unit (`POST /customers/relatives`), in the team's form. */
export default function AddFamilyMemberModal({ form, onClose }: Props) {
  const t = useTranslations("MasterData");
  const tf = useTranslations("FamilyMembersScreen");
  const tc = useTranslations("CustomersScreen");
  const { values, set, errors, pending } = form;

  const close = () => {
    if (!pending) onClose();
  };
  const errorText = (field: keyof RelativeFormErrors) =>
    errors[field] ? <p className="mt-1 text-[10px] text-red-600">{tf(`add.errors.${errors[field]}`)}</p> : null;
  const invalid = (field: keyof RelativeFormErrors) => (errors[field] ? invalidClass : "");
  const unit = values.unit;

  return (
    <ModalWrapper onClose={close} width="max-w-[520px]" labelledBy="add-family-member-title">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 id="add-family-member-title" className="text-[15px] font-bold text-gray-900">{t("addFamilyMemberModal.title")}</h2>
            <CloseButton onClick={close} label={tf("close")} />
          </div>

          {/* Fields */}
          <fieldset key={form.formKey} disabled={pending} className="flex min-w-0 flex-col gap-4 px-6 overflow-y-auto flex-1">
            {form.addedCount > 0 && (
              <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[11px] text-green-700">
                {tf("add.added", { count: form.addedCount })}
              </p>
            )}
            {form.failure && <ApiFailureNotice failure={form.failure} />}

            {/* Full Name */}
            <div>
              <FormField label={t("addFamilyMemberModal.fullName")} required>
                <input
                  type="text"
                  value={values.name}
                  onChange={(event) => set("name", event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  className={`${inputClass} ${invalid("name")}`}
                />
              </FormField>
              {errorText("name")}
            </div>

            {/* ID / Passport Type */}
            <FormField label={t("addFamilyMemberModal.idPassportType")} required>
              <select
                value={values.idType}
                onChange={(event) => set("idType", event.target.value === "passport" ? "passport" : "nationalId")}
                className={inputClass}
              >
                <option value="nationalId">{t("idTypes.id")}</option>
                <option value="passport">{t("idTypes.passport")}</option>
              </select>
            </FormField>

            {/* ID / Passport Number */}
            <div>
              <FormField label={t("addFamilyMemberModal.idPassportNumber")} required>
                <input
                  type="text"
                  value={values.idNumber}
                  onChange={(event) => set("idNumber", event.target.value)}
                  aria-invalid={Boolean(errors.idNumber)}
                  className={`${inputClass} ${invalid("idNumber")}`}
                />
              </FormField>
              {errorText("idNumber")}
            </div>

            {/* Mobile Number */}
            <div>
              <FormField label={t("addFamilyMemberModal.mobileNumber")} required>
                <input
                  type="tel"
                  value={values.mobile}
                  onChange={(event) => set("mobile", event.target.value)}
                  aria-invalid={Boolean(errors.mobile)}
                  className={`${inputClass} ${invalid("mobile")}`}
                />
              </FormField>
              {errorText("mobile")}
            </div>

            {/* Email Address */}
            <div>
              <FormField label={t("addFamilyMemberModal.email")} required>
                <input
                  type="email"
                  value={values.email}
                  onChange={(event) => set("email", event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  className={`${inputClass} ${invalid("email")}`}
                />
              </FormField>
              {errorText("email")}
            </div>

            {/* Assign to Unit: search the units that have an owner */}
            <div className="relative">
              <FormField label={t("addFamilyMemberModal.assignToUnit")} required>
                <input
                  type="text"
                  value={form.unitQuery}
                  onChange={(event) => form.setUnitQuery(event.target.value)}
                  placeholder={tf("add.unitHint")}
                  role="combobox"
                  aria-controls="add-family-unit-options"
                  aria-expanded={form.unitOptions !== null}
                  aria-autocomplete="list"
                  aria-invalid={Boolean(errors.unit)}
                  className={`${inputClass} ${invalid("unit")}`}
                />
              </FormField>
              {errorText("unit")}
              {form.unitsLoading && <p className="mt-1 text-[10px] text-gray-400">{tf("add.searchingUnits")}</p>}
              {form.unitsFailure && <ApiFailureNotice failure={form.unitsFailure} className="mt-1" />}
              {form.unitOptions && (
                <ul id="add-family-unit-options" role="listbox" className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {form.unitOptions.length === 0 && (
                    <li className="px-3 py-2 text-[11px] text-gray-400">{tf("add.noUnits")}</li>
                  )}
                  {form.unitOptions.map((option) => (
                    <li key={option.id} role="option" aria-selected={false}>
                      <button
                        type="button"
                        onClick={() => form.chooseUnit(option)}
                        className="w-full px-3 py-1.5 text-start text-[12px] text-gray-700 hover:bg-gray-50"
                      >
                        {option.projectName ?? "—"} - {option.unitNumber}
                        <span className="ms-2 text-[10px] text-gray-400">{option.owners.map((owner) => owner.name).join(", ")}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* The owner, asked only when the unit has several */}
            {unit && unit.owners.length > 1 && (
              <div>
                <FormField label={tf("add.owner")} required>
                  <select
                    value={values.ownerId ?? ""}
                    onChange={(event) => set("ownerId", event.target.value ? Number(event.target.value) : null)}
                    aria-invalid={Boolean(errors.ownerId)}
                    className={`${inputClass} ${invalid("ownerId")}`}
                  >
                    <option value="">{tf("add.chooseOwner")}</option>
                    {unit.owners.map((owner) => (
                      <option key={owner.customerId} value={owner.customerId}>{owner.name}</option>
                    ))}
                  </select>
                </FormField>
                {errorText("ownerId")}
              </div>
            )}

            {/* Relationship */}
            <FormField label={t("addFamilyMemberModal.relationship")}>
              <input
                type="text"
                value={values.relation}
                onChange={(event) => set("relation", event.target.value)}
                placeholder={t("addFamilyMemberModal.relationship")}
                className={inputClass}
              />
            </FormField>

            {/* File upload: the route takes no attachment */}
            <div>
              <input
                type="file"
                disabled
                title={tc("notAvailable")}
                className="w-full text-[12px] text-gray-700 file:mr-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 hover:file:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </fieldset>

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
              type="button"
              onClick={() => void form.submit(true)}
              disabled={pending}
              className="rounded-lg border border-blue-600 px-4 py-2 text-[12px] font-medium text-blue-600 hover:bg-blue-50 transition-colors disabled:cursor-wait disabled:opacity-60"
            >
              {t("addFamilyMemberModal.saveAndAddAnother")}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (await form.submit(false)) onClose();
              }}
              disabled={pending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:cursor-wait disabled:opacity-60"
            >
              {t("addFamilyMemberModal.submit")}
            </button>
          </div>
    </ModalWrapper>
  );
}
