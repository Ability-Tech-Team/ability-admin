"use client";

import { useTranslations } from "next-intl";
import type { Customer } from "../types";
import { avatarColorOf, initialsOf, ownershipNames, primaryUnit } from "../utils";

type CustomersTableProps = {
  customers: Customer[];
  /** True before the first page arrives. */
  loading: boolean;
  /** The status switches wait while one change is saved. */
  savingStatus: boolean;
  onOpen: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onShowAttachments: (customer: Customer) => void;
  onSetActive: (customer: Customer, active: boolean) => void;
  /** The pager, under the rows. */
  footer: React.ReactNode;
};

const badgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";
const headClass = "px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]";
const none = "—";

export default function CustomersTable({
  customers,
  loading,
  savingStatus,
  onOpen,
  onEdit,
  onShowAttachments,
  onSetActive,
  footer,
}: CustomersTableProps) {
  const t = useTranslations("MasterData");
  const tc = useTranslations("CustomersScreen");

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full min-w-[1000px] table-fixed">
        <colgroup>
          <col className="w-[120px]" />
          <col className="w-[80px]" />
          <col className="w-[95px]" />
          <col className="w-[150px]" />
          <col className="w-[80px]" />
          <col className="w-[85px]" />
          <col className="w-[70px]" />
          <col className="w-[65px]" />
          <col className="w-[60px]" />
          <col className="w-[85px]" />
          <col className="w-[70px]" />
          <col className="w-[55px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className={`${headClass} px-3`}>{t("columns.customer")}</th>
            <th className={headClass}>{t("columns.idPassportType")}</th>
            <th className={headClass}>{t("columns.idPassport")}</th>
            <th className={headClass}>{t("columns.contact")}</th>
            <th className={headClass}>{t("columns.project")}</th>
            <th className={headClass}>{t("columns.unit")}</th>
            <th className={headClass}>{t("columns.nationality")}</th>
            <th className={headClass}>{t("columns.customerType")}</th>
            <th className={headClass}>{t("columns.joinDate")}</th>
            <th className={headClass}>{t("columns.status")}</th>
            <th className={headClass}>{t("columns.attachments")}</th>
            <th className={headClass}>{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 && (
            <tr>
              <td colSpan={12} className="px-3 py-10 text-center text-[11px] text-gray-400" aria-live="polite">
                {loading ? tc("loading") : tc("empty")}
              </td>
            </tr>
          )}
          {customers.map((customer) => {
            const unit = primaryUnit(customer);
            const otherUnits = customer.units.length - 1;
            const types = ownershipNames(customer);
            return (
              <tr
                key={customer.id}
                tabIndex={0}
                onClick={() => onOpen(customer)}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onOpen(customer);
                  }
                }}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 focus:outline-none focus-visible:bg-blue-50/50 transition-colors cursor-pointer"
              >
                {/* Customer */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarColorOf(customer.id)}`}>
                      {initialsOf(customer.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-gray-900">{customer.name}</p>
                      {customer.code && <p className="text-[9px] text-gray-400">{customer.code}</p>}
                    </div>
                  </div>
                </td>

                {/* ID / Passport Type */}
                <td className="px-2 py-3">
                  {customer.idTypeName ? (
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${badgeClass}`}>
                      {customer.idTypeName}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400">{none}</span>
                  )}
                </td>

                {/* ID / Passport Number */}
                <td className="px-2 py-3 text-[11px] text-gray-600 break-all">{customer.idNumber}</td>

                {/* Contact */}
                <td className="px-2 py-3">
                  <p className="truncate text-[11px] text-gray-900">{customer.email ?? none}</p>
                  <p className="text-[9px] text-gray-400">{customer.mobile ?? none}</p>
                </td>

                {/* Project */}
                <td className="px-2 py-3 text-[11px] font-semibold text-gray-900">{unit?.projectName ?? none}</td>

                {/* Unit */}
                <td className="px-2 py-3 text-[11px] text-gray-600">
                  {unit ? unit.unitNumber : none}
                  {otherUnits > 0 && <span className="block text-[9px] text-gray-400">{tc("moreUnits", { count: otherUnits })}</span>}
                </td>

                {/* Nationality: the API gives the country */}
                <td className="px-2 py-3 text-[11px] text-gray-600">{customer.countryName ?? none}</td>

                {/* Type: owner, renter... on their units */}
                <td className="px-2 py-3">
                  {types.length ? (
                    <div className="flex flex-wrap gap-1">
                      {types.map((type) => (
                        <span key={type} className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${badgeClass}`}>
                          {type}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400">{none}</span>
                  )}
                </td>

                {/* Join Date: when the record was created */}
                <td className="px-2 py-3 text-[11px] text-gray-600">{customer.createdOn ?? none}</td>

                {/* Status */}
                <td className="px-2 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={customer.active}
                    disabled={savingStatus}
                    onClick={(e) => { e.stopPropagation(); onSetActive(customer, !customer.active); }}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 disabled:cursor-wait disabled:opacity-60"
                  >
                    <div className={`relative h-[14px] w-[26px] shrink-0 rounded-full transition-colors ${customer.active ? "bg-blue-500" : "bg-gray-200"}`}>
                      <div className={`absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white shadow-sm transition-all ${customer.active ? "start-[14px]" : "start-[2px]"}`} />
                    </div>
                    <span className={`text-[10px] font-medium ${customer.active ? "text-gray-700" : "text-gray-400"}`}>
                      {customer.active ? t("active") : t("inactive")}
                    </span>
                  </button>
                </td>

                {/* Attachments */}
                <td className="px-2 py-3">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onShowAttachments(customer); }}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="text-[10px] font-medium text-gray-900 hover:text-gray-700"
                  >
                    {t("show")}
                    {customer.attachments.length > 0 && ` (${customer.attachments.length})`}
                  </button>
                </td>

                {/* Actions */}
                <td className="px-2 py-3">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit(customer); }}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="rounded-md border border-gray-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-gray-600 shadow-[0_3px_6px_-2px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-colors"
                  >
                    {t("edit")}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3">{footer}</div>
    </div>
  );
}
