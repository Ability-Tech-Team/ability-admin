"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Customer } from "@/src/services/customers";

type EditCustomerModalProps = {
  customer: Customer;
  onClose: () => void;
  onSave: (updated: Customer) => void;
  onDelete: () => void;
};

export default function EditCustomerModal({ customer, onClose, onSave, onDelete }: EditCustomerModalProps) {
  const t = useTranslations("MasterData");

  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email);
  const [idType, setIdType] = useState<"id" | "passport">(customer.idType);
  const [idNumber, setIdNumber] = useState(customer.idNumber);
  const [nationality, setNationality] = useState(customer.nationality);
  const [project, setProject] = useState(customer.project);
  const [unit, setUnit] = useState(customer.unit);
  const [joinDate, setJoinDate] = useState(customer.joinDate);

  function handleSave() {
    onSave({
      ...customer,
      name,
      phone,
      email,
      idType,
      idNumber,
      nationality,
      project,
      unit,
      joinDate,
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-60 bg-black/20 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4" onClick={onClose}>
        <div className="w-full max-w-[580px] rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3">
            <h2 className="text-[13px] font-semibold text-gray-900">{t("editCustomer")}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <div className="px-5 pb-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {/* Customer Name */}
              <Field label={t("formFields.customerName")} required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] text-gray-900 outline-none focus:border-blue-400 transition-colors"
                />
              </Field>

              {/* Mobile Number */}
              <Field label={t("formFields.mobileNumber")} required>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] text-gray-900 outline-none focus:border-blue-400 transition-colors"
                />
              </Field>

              {/* Email */}
              <Field label={t("formFields.email")}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] text-gray-900 outline-none focus:border-blue-400 transition-colors"
                />
              </Field>

              {/* ID / Passport Type */}
              <Field label={t("formFields.idPassportType")}>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value as "id" | "passport")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] text-gray-900 outline-none focus:border-blue-400 transition-colors bg-white"
                >
                  <option value="id">{t("idTypes.id")}</option>
                  <option value="passport">{t("idTypes.passport")}</option>
                </select>
              </Field>

              {/* ID / Passport Number */}
              <Field label={t("formFields.idPassportNumber")} required>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] text-gray-900 outline-none focus:border-blue-400 transition-colors"
                />
              </Field>

              {/* Nationality */}
              <Field label={t("formFields.nationality")}>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] text-gray-900 outline-none focus:border-blue-400 transition-colors"
                />
              </Field>

              {/* Project */}
              <Field label={t("formFields.project")} required>
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] text-gray-900 outline-none focus:border-blue-400 transition-colors"
                />
              </Field>

              {/* Assigned Unit */}
              <Field label={t("formFields.assignedUnit")}>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] text-gray-900 outline-none focus:border-blue-400 transition-colors"
                />
              </Field>

              {/* Join Date */}
              <Field label={t("formFields.joinDate")} required>
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] text-gray-900 outline-none focus:border-blue-400 transition-colors"
                />
              </Field>

              {/* Identity Attachment */}
              <Field label={t("formFields.identityAttachment")}>
                <input
                  type="file"
                  className="w-full text-[12px] text-gray-500 file:mr-3 file:rounded-lg file:border file:border-blue-200 file:bg-blue-50 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-blue-600 file:cursor-pointer hover:file:bg-blue-100 file:transition-colors"
                />
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-3 border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-full bg-red-600 px-5 py-2 text-[11px] font-medium text-white hover:bg-red-700 transition-colors"
            >
              {t("removeCustomer")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 bg-white px-5 py-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full bg-blue-600 px-5 py-2 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {t("saveChanges")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-medium text-gray-500">
        {label}
        {required && <span className="text-red-500 ms-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
