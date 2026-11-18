"use client";

import { useTranslations } from "next-intl";
import type { Customer } from "@/src/services/customers";
import DetailPanel from "@/src/components/DetailPanel";

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
    <DetailPanel title={t("customerProfile")} onClose={onClose} width="w-[400px]">
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
    </DetailPanel>
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

