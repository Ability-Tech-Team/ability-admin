"use client";

import { useFormatter, useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import FormField from "@/src/components/FormField";
import SelectWrapper from "@/src/components/SelectWrapper";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import OwnedUnitPicker from "@/src/components/OwnedUnitPicker";
import { useNewServiceRequest } from "../hooks/useNewServiceRequest";
import { optionalId, type NewRequestField } from "../utils";

type Props = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  onClose: () => void;
  /** After the request is created: the list and the counts reload. */
  onCreated: () => void;
};

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors disabled:bg-gray-50";
const selectClass = `${inputClass} appearance-none ps-3 pe-10`;
const invalidClass = "border-red-300";

/**
 * New Service Request (`POST /orders/tickets`), in the team's form: the mock's service type is
 * the department and its service, its project and customer come from the chosen unit, and its
 * due date and time slot are the ticket's arrival time.
 */
export default function NewServiceRequestModal({ apiBaseUrl, portalBaseUrl, onClose, onCreated }: Props) {
  const t = useTranslations("Operations");
  const ts = useTranslations("ServiceRequestsScreen");
  const tf = useTranslations("FamilyMembersScreen");
  const format = useFormatter();
  const form = useNewServiceRequest({ apiBaseUrl, portalBaseUrl, onCreated });
  const { values, set, errors, pending, unitSearch } = form;
  const unit = unitSearch.unit;
  const owner = unitSearch.owner;

  const close = () => {
    if (!pending) onClose();
  };
  const errorText = (field: NewRequestField) =>
    errors[field] ? <p className="mt-1 text-[10px] text-red-600">{ts(`create.errors.${errors[field]}`)}</p> : null;
  const invalid = (field: NewRequestField) => (errors[field] ? invalidClass : "");
  const errorMessage = (field: NewRequestField) => (errors[field] ? ts(`create.errors.${errors[field]}`) : null);

  return (
    <ModalWrapper onClose={close} width="max-w-[520px]" labelledBy="new-service-request-title">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h2 id="new-service-request-title" className="text-[15px] font-bold text-gray-900">{ts("create.title")}</h2>
        <CloseButton onClick={close} label={ts("close")} />
      </div>

      {/* Fields */}
      <fieldset disabled={pending} className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-4 overflow-y-auto px-6">
        {form.failure && (
          <div className="col-span-2">
            <ApiFailureNotice failure={form.failure} />
          </div>
        )}

        {/* Notes (the mock's issue title: the ticket's only free text) */}
        <div className="col-span-2">
          <FormField label={ts("detail.notes")}>
            <input
              type="text"
              value={values.notes}
              onChange={(event) => set("notes", event.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>

        {/* Unit, and its owner when it has several */}
        <div className="col-span-2 grid grid-cols-2 gap-x-4 gap-y-4">
          <OwnedUnitPicker
            search={unitSearch}
            labels={{
              unit: t("detail.unit"),
              hint: tf("add.unitHint"),
              searching: tf("add.searchingUnits"),
              noUnits: tf("add.noUnits"),
              owner: tf("add.owner"),
              chooseOwner: tf("add.chooseOwner"),
            }}
            unitError={errorMessage("unit")}
            ownerError={errorMessage("ownerId")}
            inputClass={inputClass}
            invalidClass={invalidClass}
          />
        </div>

        {/* Project: the unit's */}
        <FormField label={ts("create.project")}>
          <input type="text" value={unit?.projectName ?? ""} readOnly disabled className={inputClass} />
        </FormField>

        {/* Customer: the unit's owner, with the mobile from their record */}
        <div>
          <FormField label={t("detail.customer")}>
            <input
              type="text"
              value={owner ? [owner.name, form.ownerMobile].filter(Boolean).join(" · ") : ""}
              readOnly
              disabled
              aria-invalid={Boolean(errors.customer)}
              className={`${inputClass} ${invalid("customer")}`}
            />
          </FormField>
          {errorText("customer")}
          {form.customerLoading && <p className="mt-1 text-[10px] text-gray-400">{ts("create.loadingCustomer")}</p>}
          {form.customerFailure && (
            <ApiFailureNotice failure={form.customerFailure} onRetry={form.reloadCustomer} className="mt-1" />
          )}
        </div>

        {/* Service type: the department, then one of its services */}
        <div>
          <FormField label={ts("create.department")} required>
            <SelectWrapper>
              <select
                value={form.departmentId ?? ""}
                onChange={(event) => set("departmentId", optionalId(event.target.value))}
                disabled={!unit || form.departmentsLoading}
                title={unit ? undefined : ts("create.chooseUnitFirst")}
                aria-invalid={Boolean(errors.departmentId)}
                className={`${selectClass} ${invalid("departmentId")}`}
              >
                <option value="">{form.departmentsLoading ? ts("create.loadingOptions") : ts("create.chooseDepartment")}</option>
                {form.departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
            </SelectWrapper>
          </FormField>
          {errorText("departmentId")}
          {form.departmentsFailure && (
            <ApiFailureNotice failure={form.departmentsFailure} onRetry={form.reloadDepartments} className="mt-1" />
          )}
        </div>

        <div>
          <FormField label={ts("create.service")} required>
            <SelectWrapper>
              <select
                value={form.service?.id ?? ""}
                onChange={(event) => set("serviceId", optionalId(event.target.value))}
                disabled={form.departmentId === null || form.servicesLoading}
                aria-invalid={Boolean(errors.serviceId)}
                className={`${selectClass} ${invalid("serviceId")}`}
              >
                <option value="">
                  {form.servicesLoading
                    ? ts("create.loadingOptions")
                    : form.departmentId !== null && form.serviceOptions.length === 0 && !form.servicesFailure
                      ? ts("create.noServices")
                      : ts("create.chooseService")}
                </option>
                {form.serviceOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </SelectWrapper>
          </FormField>
          {errorText("serviceId")}
          {form.servicesFailure && (
            <ApiFailureNotice failure={form.servicesFailure} onRetry={form.reloadServices} className="mt-1" />
          )}
        </div>

        {/* Quantity, and the service's listed price (the API charges that price) */}
        <div>
          <FormField label={ts("create.quantity")} required>
            <input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={values.quantity}
              onChange={(event) => set("quantity", event.target.value)}
              aria-invalid={Boolean(errors.quantity)}
              className={`${inputClass} ${invalid("quantity")}`}
            />
          </FormField>
          {errorText("quantity")}
        </div>

        <FormField label={ts("create.price")}>
          <input
            type="text"
            value={form.service ? format.number(form.service.price) : ""}
            readOnly
            disabled
            className={inputClass}
          />
        </FormField>

        {/* Requester: the owner until edited */}
        <div>
          <FormField label={ts("create.requesterName")} required>
            <input
              type="text"
              value={form.requester.name}
              onChange={(event) => set("requesterName", event.target.value)}
              aria-invalid={Boolean(errors.requesterName)}
              className={`${inputClass} ${invalid("requesterName")}`}
            />
          </FormField>
          {errorText("requesterName")}
        </div>

        <div>
          <FormField label={ts("create.requesterMobile")} required>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              value={form.requester.mobile}
              onChange={(event) => set("requesterMobile", event.target.value)}
              aria-invalid={Boolean(errors.requesterMobile)}
              className={`${inputClass} ${invalid("requesterMobile")}`}
            />
          </FormField>
          {errorText("requesterMobile")}
        </div>

        {/* Due date and time: the ticket's arrival time, Cairo time */}
        <div>
          <FormField label={t("columns.dueDate")} required>
            <input
              type="date"
              min={form.minDueDate}
              value={values.dueDate}
              onChange={(event) => set("dueDate", event.target.value)}
              aria-invalid={Boolean(errors.dueDate)}
              className={`${inputClass} ${invalid("dueDate")}`}
            />
          </FormField>
          {errorText("dueDate")}
        </div>

        <div>
          <FormField label={ts("create.dueTimeSlot")} required>
            <input
              type="time"
              value={values.dueTime}
              onChange={(event) => set("dueTime", event.target.value)}
              aria-invalid={Boolean(errors.dueTime)}
              className={`${inputClass} ${invalid("dueTime")}`}
            />
          </FormField>
          {errorText("dueTime")}
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
          {ts("create.cancel")}
        </button>
        <button
          type="button"
          onClick={async () => {
            if (await form.submit()) onClose();
          }}
          disabled={pending || form.customerLoading}
          aria-busy={pending || undefined}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          {ts("create.submit")}
        </button>
      </div>
    </ModalWrapper>
  );
}
