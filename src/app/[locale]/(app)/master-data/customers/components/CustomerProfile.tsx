"use client";

import { useTranslations } from "next-intl";
import type { Customer } from "@/src/services/customers";

type CustomerProfileProps = {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShowAttachments: () => void;
};

const typeBadgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";

export default function CustomerProfile({ customer, onClose, onEdit, onDelete, onShowAttachments }: CustomerProfileProps) {
  const t = useTranslations("MasterData");

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 end-0 z-50 flex w-[400px] flex-col bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-[13px] font-semibold text-gray-900">{t("customerProfile")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-6 border-t border-gray-100" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Customer identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-400 text-[12px] font-bold text-white">
              {customer.initials}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">{customer.name}</p>
              <p className="text-[10px] text-gray-400">{customer.nameAr}</p>
            </div>
          </div>

          {/* Status + Type badges */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-medium ${customer.active ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${customer.active ? "bg-emerald-500" : "bg-gray-300"}`} />
              {customer.active ? t("active") : t("inactive")}
            </span>
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-medium ${typeBadgeClass}`}>
              {t(`customerTypes.${customer.customerType}` as Parameters<typeof t>[0])}
            </span>
          </div>

          {/* Details */}
          <div className="mt-6 flex flex-col">
            <DetailRow label={t("profileFields.email")} value={customer.email} />
            <DetailRow label={t("profileFields.phone")} value={customer.phone} />
            <DetailRow label={t("profileFields.nationality")} value={customer.nationality} />
            <DetailRow label={t("profileFields.idType")} value={t(`idTypes.${customer.idType}` as Parameters<typeof t>[0])} />
            <DetailRow label={t("profileFields.idNumber")} value={customer.idNumber} />
            <DetailRow label={t("profileFields.unit")} value={customer.unit} />
            <DetailRow label={t("profileFields.joinDate")} value={customer.joinDate} last />
          </div>

          {/* Actions */}
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 rounded-lg bg-blue-600 py-1.5 text-[10px] font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {t("editProfile")}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 rounded-lg bg-red-600 py-1.5 text-[10px] font-medium text-white hover:bg-red-700 transition-colors"
            >
              {t("deleteCustomer")}
            </button>
            <button
              type="button"
              onClick={onShowAttachments}
              className="flex-1 rounded-lg border border-gray-200 bg-white py-1.5 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t("showAttachments")}
            </button>
          </div>
        </div>
      </div>

    </>
  );
}

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2.5 ${last ? "" : "border-b border-gray-100"}`}>
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="text-[10px] font-medium text-gray-900 text-end">{value}</span>
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
