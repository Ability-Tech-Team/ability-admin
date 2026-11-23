"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import type { Customer, CustomerUnit } from "@/src/services/customers";
import { useResidentSearch } from "../hooks/useGuestInvitationsPage";
import type { GuestInvitationFormField, GuestInvitationFormValues } from "../types";
import { emptyGuestInvitationForm, GUEST_REQUIRED, invalidGuestFields, invitableUnits } from "../utils";

type Props = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** Resolves with the new invitation's id, or undefined when refused. */
  onCreate: (values: GuestInvitationFormValues, unit: CustomerUnit) => Promise<number | undefined>;
  saving: boolean;
  failure: ApiFailure | null;
  onClose: () => void;
};

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors disabled:bg-gray-50";
const labelClass = "mb-1 block text-[11px] font-medium text-gray-700";

/** An invitation made on a resident's behalf, for one of their active units. */
export default function CreateGuestInvitationModal({ apiBaseUrl, portalBaseUrl, onCreate, saving, failure, onClose }: Props) {
  const t = useTranslations("Operations");
  const tg = useTranslations("GuestInvitationsScreen");
  const [values, setValues] = useState<GuestInvitationFormValues>(emptyGuestInvitationForm);
  const [invalid, setInvalid] = useState<GuestInvitationFormField[]>([]);
  const [residentText, setResidentText] = useState("");
  const residents = useResidentSearch({ apiBaseUrl, portalBaseUrl }, residentText);
  const [created, setCreated] = useState<number | null>(null);
  // Kept once chosen, so a new search doesn't drop the resident's units.
  const [resident, setResident] = useState<Customer | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const residentOptions = residents.data?.customers ?? [];
  const units = resident ? invitableUnits(resident.units) : [];
  const unit = units.find((item) => String(item.unitId) === values.unitId) ?? null;

  function change(field: GuestInvitationFormField, value: string) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
      // Another resident has other units.
      ...(field === "residentId" && { unitId: "" }),
    }));
    setInvalid((previous) => previous.filter((name) => name !== field));
  }

  async function submit() {
    const fields = invalidGuestFields(values);
    setInvalid(fields);
    if (fields.length > 0 || !unit) return;
    const invitationId = await onCreate(values, unit);
    if (invitationId !== undefined) setCreated(invitationId);
  }

  const star = (field: GuestInvitationFormField) =>
    GUEST_REQUIRED.includes(field) && <span className="text-red-500"> *</span>;
  const error = (field: GuestInvitationFormField) =>
    invalid.includes(field) && (
      <p className="mt-0.5 text-[10px] text-red-600">
        {field === "validTo" && values.validTo ? tg("periodInvalid") : tg("requiredField")}
      </p>
    );
  const border = (field: GuestInvitationFormField) => (invalid.includes(field) ? " border-red-300" : "");

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-guest-title"
          className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 id="create-guest-title" className="text-[15px] font-bold text-gray-900">{t("guest.create.title")}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("guest.create.cancel")}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {created !== null ? (
            <div className="px-6 pb-5">
              <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">
                {tg("created", { id: created })}
              </p>
              <div className="flex justify-end pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  {tg("close")}
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              {/* Fields */}
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 px-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="guest-name" className={labelClass}>{t("guest.create.guestName")}{star("guestName")}</label>
                  <input id="guest-name" value={values.guestName} onChange={(e) => change("guestName", e.target.value)} disabled={saving} className={inputClass + border("guestName")} />
                  {error("guestName")}
                </div>
                <div>
                  <label htmlFor="guest-phone" className={labelClass}>{t("guest.create.guestPhone")}{star("guestPhone")}</label>
                  <input id="guest-phone" type="tel" value={values.guestPhone} onChange={(e) => change("guestPhone", e.target.value)} disabled={saving} className={inputClass + border("guestPhone")} />
                  {error("guestPhone")}
                </div>
                <div>
                  <label htmlFor="guest-email" className={labelClass}>{tg("fields.guestEmail")}</label>
                  <input id="guest-email" type="email" value={values.guestEmail} onChange={(e) => change("guestEmail", e.target.value)} disabled={saving} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="guest-gender" className={labelClass}>{tg("fields.guestGender")}</label>
                  <select id="guest-gender" value={values.guestGender} onChange={(e) => change("guestGender", e.target.value)} disabled={saving} className={inputClass}>
                    <option value="">{tg("choose")}</option>
                    <option value="male">{tg("genders.male")}</option>
                    <option value="female">{tg("genders.female")}</option>
                  </select>
                </div>

                {/* Resident: searched in the customers, then chosen */}
                <div className="sm:col-span-2">
                  <label htmlFor="guest-resident-search" className={labelClass}>{t("guest.create.residentName")}{star("residentId")}</label>
                  <input
                    id="guest-resident-search"
                    type="search"
                    value={residentText}
                    onChange={(e) => setResidentText(e.target.value)}
                    placeholder={tg("residentSearch")}
                    disabled={saving}
                    className={inputClass}
                  />
                  <select
                    aria-label={t("guest.create.residentName")}
                    value={values.residentId}
                    onChange={(e) => {
                      setResident(residentOptions.find((customer) => String(customer.id) === e.target.value) ?? null);
                      change("residentId", e.target.value);
                    }}
                    disabled={saving || (residentOptions.length === 0 && !resident)}
                    className={`mt-2 ${inputClass}${border("residentId")}`}
                  >
                    <option value="">
                      {residents.loading ? tg("searching") : residentText.trim().length < 2 ? tg("typeToSearch") : residentOptions.length ? tg("choose") : tg("noResidents")}
                    </option>
                    {resident && !residentOptions.some((customer) => customer.id === resident.id) && (
                      <option value={resident.id}>{resident.name}</option>
                    )}
                    {residentOptions.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.mobile ? `${customer.name} · ${customer.mobile}` : customer.name}
                      </option>
                    ))}
                  </select>
                  {residents.failure && <ApiFailureNotice failure={residents.failure} onRetry={residents.reload} className="mt-2" />}
                  {error("residentId")}
                </div>

                <div>
                  <label htmlFor="guest-unit" className={labelClass}>{t("guest.create.unit")}{star("unitId")}</label>
                  <select
                    id="guest-unit"
                    value={values.unitId}
                    onChange={(e) => change("unitId", e.target.value)}
                    disabled={saving || units.length === 0}
                    className={inputClass + border("unitId")}
                  >
                    <option value="">{resident && units.length === 0 ? tg("noUnits") : tg("choose")}</option>
                    {units.map((item) => (
                      <option key={item.unitId} value={item.unitId}>{item.unitNumber}</option>
                    ))}
                  </select>
                  {error("unitId")}
                </div>
                <div>
                  <label htmlFor="guest-project" className={labelClass}>{t("guest.create.project")}</label>
                  {/* The unit's project: the invitation goes to it. */}
                  <input id="guest-project" readOnly value={unit?.projectName ?? ""} className={inputClass} />
                </div>

                <div>
                  <label htmlFor="guest-valid-from" className={labelClass}>{tg("fields.validFrom")}{star("validFrom")}</label>
                  <input id="guest-valid-from" type="datetime-local" value={values.validFrom} onChange={(e) => change("validFrom", e.target.value)} disabled={saving} className={inputClass + border("validFrom")} />
                  {error("validFrom")}
                </div>
                <div>
                  <label htmlFor="guest-valid-to" className={labelClass}>{tg("fields.validTo")}{star("validTo")}</label>
                  <input id="guest-valid-to" type="datetime-local" value={values.validTo} onChange={(e) => change("validTo", e.target.value)} disabled={saving} className={inputClass + border("validTo")} />
                  {error("validTo")}
                </div>
                <p className="text-[10px] text-gray-400 sm:col-span-2">{tg("cairoTime")}</p>
              </div>

              {failure && <ApiFailureNotice failure={failure} className="mx-6 mt-4" />}

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 pt-5 pb-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t("guest.create.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  {saving ? tg("saving") : t("guest.createInvitation")}
                </button>
              </div>
            </form>
          )}
        </div>
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
