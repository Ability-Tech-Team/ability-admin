"use client";

import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import SelectWrapper from "@/src/components/SelectWrapper";
import OwnedUnitPicker from "@/src/components/OwnedUnitPicker";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { COMPLAINT_DETAILS_MAX_LENGTH } from "@/src/services/complaints";
import { useNewComplaint } from "../hooks/useNewComplaint";
import { optionalId, type ComplaintFormField } from "../utils";

type Props = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  onClose: () => void;
  /** After the complaint is saved (the screen closes the modal and reloads). */
  onCreated: () => void;
};

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors disabled:bg-gray-50";
const selectClass = `${inputClass} appearance-none bg-white pe-8 disabled:cursor-not-allowed`;
const readOnlyClass = `${inputClass} bg-gray-50 text-gray-500`;
const textareaClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none";
const invalidClass = "border-red-300";

/**
 * New Complaint (`POST /orders/complains`), in the team's form: the complaint type and its
 * description, the unit (its project shown from it) and the owner it is recorded for, the
 * status, and the date. The type's department goes with it.
 */
export default function NewComplaintModal({ apiBaseUrl, portalBaseUrl, onClose, onCreated }: Props) {
  const t = useTranslations("Operations");
  const tc = useTranslations("ComplaintsScreen");
  const tf = useTranslations("FamilyMembersScreen");
  const form = useNewComplaint({ apiBaseUrl, portalBaseUrl, onCreated });
  const { values, set, errors, pending, unitSearch } = form;
  const unit = unitSearch.unit;
  const severalOwners = unit !== null && unit.owners.length > 1;

  const close = () => {
    if (!pending) onClose();
  };
  const errorMessage = (field: ComplaintFormField) => {
    const problem = errors[field];
    if (!problem) return null;
    return problem === "tooLong"
      ? t("complaint.create.errors.tooLong", { max: COMPLAINT_DETAILS_MAX_LENGTH })
      : t("complaint.create.errors.required");
  };
  const errorText = (field: ComplaintFormField) => {
    const message = errorMessage(field);
    return message ? <p className="mt-1 text-[10px] text-red-600">{message}</p> : null;
  };
  const invalid = (field: ComplaintFormField) => (errors[field] ? invalidClass : "");

  // What a list's empty choice says: pick a unit first, wait for the lists, or choose.
  const listPlaceholder = (choose: string, none: string, count: number) => {
    if (!unit) return t("complaint.create.chooseUnitFirst");
    if (form.listsLoading) return t("complaint.create.loadingLists");
    return count === 0 && !form.listsFailure ? none : choose;
  };
  const listsDisabled = !unit || form.listsLoading;

  return (
    <ModalWrapper onClose={close} width="max-w-[520px]" labelledBy="new-complaint-title">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h2 id="new-complaint-title" className="text-[15px] font-bold text-gray-900">{t("complaint.create.title")}</h2>
        <CloseButton onClick={close} label={tc("close")} />
      </div>

      {/* Fields */}
      <fieldset disabled={pending} className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-4 overflow-y-auto px-6">
        {form.failure && <ApiFailureNotice failure={form.failure} className="col-span-2" />}
        {form.listsFailure && (
          <ApiFailureNotice failure={form.listsFailure} onRetry={form.reloadLists} className="col-span-2" />
        )}

        {/* Type (the design's Subject): the unit's project's complaint types */}
        <div className="col-span-2">
          <FormField label={t("complaint.create.type")} required>
            <SelectWrapper>
              <select
                value={form.typeId ?? ""}
                onChange={(event) => set("typeId", optionalId(event.target.value))}
                disabled={listsDisabled}
                aria-invalid={Boolean(errors.type)}
                className={`${selectClass} ${invalid("type")}`}
              >
                <option value="">
                  {listPlaceholder(t("complaint.create.chooseType"), t("complaint.create.noTypes"), form.types.length)}
                </option>
                {form.types.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </SelectWrapper>
          </FormField>
          {errorText("type")}
        </div>

        {/* Description: the complaint's details */}
        <div className="col-span-2">
          <FormField label={t("complaint.create.description")} required>
            <textarea
              rows={4}
              value={values.details}
              onChange={(event) => set("details", event.target.value)}
              maxLength={COMPLAINT_DETAILS_MAX_LENGTH}
              aria-invalid={Boolean(errors.details)}
              className={`${textareaClass} ${invalid("details")}`}
            />
          </FormField>
          {errorText("details")}
        </div>

        {/* Project: the chosen unit's */}
        <FormField label={t("complaint.create.project")}>
          <input type="text" value={unit?.projectName ?? ""} readOnly tabIndex={-1} className={readOnlyClass} />
        </FormField>

        {/* Unit, and the owner when the unit has several (the design's Customer) */}
        <OwnedUnitPicker
          search={unitSearch}
          labels={{
            unit: t("complaint.create.unit"),
            hint: tf("add.unitHint"),
            searching: tf("add.searchingUnits"),
            noUnits: tf("add.noUnits"),
            owner: t("complaint.create.customer"),
            chooseOwner: tf("add.chooseOwner"),
          }}
          unitError={errorMessage("unit")}
          ownerError={errorMessage("owner")}
          inputClass={inputClass}
          invalidClass={invalidClass}
        />

        {/* Customer: the unit's only owner */}
        {!severalOwners && (
          <FormField label={t("complaint.create.customer")}>
            <input type="text" value={unitSearch.owner?.name ?? ""} readOnly tabIndex={-1} className={readOnlyClass} />
          </FormField>
        )}

        {/* Status: Open unless another is chosen */}
        <div>
          <FormField label={t("complaint.create.status")} required>
            <SelectWrapper>
              <select
                value={form.statusId ?? ""}
                onChange={(event) => set("statusId", optionalId(event.target.value))}
                disabled={listsDisabled}
                aria-invalid={Boolean(errors.status)}
                className={`${selectClass} ${invalid("status")}`}
              >
                {form.statusId === null && (
                  <option value="">
                    {listPlaceholder(t("complaint.create.chooseStatus"), t("complaint.create.chooseStatus"), form.statuses.length)}
                  </option>
                )}
                {form.statuses.map((status) => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </SelectWrapper>
          </FormField>
          {errorText("status")}
        </div>

        {/* Complaint date: today unless changed */}
        <div>
          <FormField label={t("complaint.create.date")} required>
            <input
              type="date"
              value={values.date}
              onChange={(event) => set("date", event.target.value)}
              aria-invalid={Boolean(errors.date)}
              className={`${inputClass} ${invalid("date")}`}
            />
          </FormField>
          {errorText("date")}
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
          {t("complaint.create.cancel")}
        </button>
        <button
          type="button"
          onClick={() => void form.submit()}
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          {t("complaint.create.submit")}
        </button>
      </div>
    </ModalWrapper>
  );
}
