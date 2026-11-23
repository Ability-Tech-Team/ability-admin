"use client";

import { useLocale, useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import DetailPanel from "@/src/components/DetailPanel";
import type { ApiFailure } from "@/src/lib/apiFailure";
import type { Customer, CustomerDetail } from "../types";
import { avatarColorOf, initialsOf, ownershipNames } from "../utils";

type CustomerProfileProps = {
  customer: Customer;
  /** The customer as `GET /customers/:id` gives it, with their projects. */
  detail: { data: CustomerDetail | null; loading: boolean; failure: ApiFailure | null; reload: () => void };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShowAttachments: () => void;
};

const typeBadgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";
const none = "—";

export default function CustomerProfile({ customer: row, detail, onClose, onEdit, onDelete, onShowAttachments }: CustomerProfileProps) {
  const t = useTranslations("MasterData");
  const tc = useTranslations("CustomersScreen");
  // The detail is fresher; until it arrives, the row shows.
  const customer = detail.data ?? row;
  const types = ownershipNames(customer);
  const list = new Intl.ListFormat(useLocale(), { type: "unit" });

  return (
    <DetailPanel title={t("customerProfile")} onClose={onClose} width="w-full max-w-[400px]" closeLabel={tc("close")}>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Customer identity */}
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ${avatarColorOf(customer.id)}`}>
              {initialsOf(customer.name)}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">{customer.name}</p>
              {customer.code && <p className="text-[10px] text-gray-400">{customer.code}</p>}
            </div>
          </div>

          {/* Status + Type badges */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-medium ${customer.active ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${customer.active ? "bg-emerald-500" : "bg-gray-300"}`} />
              {customer.active ? t("active") : t("inactive")}
            </span>
            {types.map((type) => (
              <span key={type} className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-medium ${typeBadgeClass}`}>
                {type}
              </span>
            ))}
          </div>

          {detail.failure && <ApiFailureNotice failure={detail.failure} onRetry={detail.reload} className="mt-4" />}

          {/* Details */}
          <div className="mt-6 flex flex-col" aria-busy={detail.loading || undefined}>
            <DetailRow label={t("profileFields.email")} value={customer.email ?? none} />
            <DetailRow label={t("profileFields.phone")} value={customer.mobile ?? none} />
            <DetailRow label={t("profileFields.nationality")} value={customer.countryName ?? none} />
            <DetailRow label={t("profileFields.idType")} value={customer.idTypeName ?? none} />
            <DetailRow label={t("profileFields.idNumber")} value={customer.idNumber} />
            <DetailRow label={tc("fields.customerType")} value={customer.customerTypeName ?? none} />
            <DetailRow label={tc("fields.maritalStatus")} value={customer.maritalStatusName ?? none} />
            <DetailRow label={tc("fields.religion")} value={customer.religionName ?? none} />
            <DetailRow
              label={t("profileFields.unit")}
              value={
                customer.units.length
                  ? list.format(customer.units.map((unit) => `${unit.projectName ?? ""} - ${unit.unitNumber}`))
                  : none
              }
            />
            <DetailRow
              label={tc("fields.projects")}
              value={detail.data ? list.format(detail.data.projects.map((project) => project.name ?? `#${project.id}`)) || none : none}
            />
            <DetailRow label={t("profileFields.joinDate")} value={customer.createdOn ?? none} last />
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
