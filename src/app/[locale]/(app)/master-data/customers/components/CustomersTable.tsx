"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Customer } from "@/src/services/customers";
import CustomerProfile from "./CustomerProfile";
import EditCustomerModal from "./EditCustomerModal";
import AttachmentsModal from "./AttachmentsModal";

type CustomersTableProps = {
  data: Customer[];
};

const badgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";

export default function CustomersTable({ data }: CustomersTableProps) {
  const t = useTranslations("MasterData");
  const [customers, setCustomers] = useState(data);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [attachmentsCustomer, setAttachmentsCustomer] = useState<Customer | null>(null);

  function toggleActive(id: string) {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  }

  return (
    <>
      <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-fixed">
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
              <th className="px-3 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.customer")}</th>
              <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.idPassportType")}</th>
              <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.idPassport")}</th>
              <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.contact")}</th>
              <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.project")}</th>
              <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.unit")}</th>
              <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.nationality")}</th>
              <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.customerType")}</th>
              <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.joinDate")}</th>
              <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.status")}</th>
              <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.attachments")}</th>
              <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                {/* Customer */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${customer.avatarColor}`}>
                      {customer.initials}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-[9px] text-gray-400">{customer.nameAr}</p>
                    </div>
                  </div>
                </td>

                {/* ID / Passport Type */}
                <td className="px-2 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${badgeClass}`}>
                    {t(`idTypes.${customer.idType}` as Parameters<typeof t>[0])}
                  </span>
                </td>

                {/* ID / Passport Number */}
                <td className="px-2 py-3 text-[11px] text-gray-600">{customer.idNumber}</td>

                {/* Contact */}
                <td className="px-2 py-3">
                  <p className="text-[11px] text-gray-900">{customer.email}</p>
                  <p className="text-[9px] text-gray-400">{customer.phone}</p>
                </td>

                {/* Project */}
                <td className="px-2 py-3 text-[11px] font-semibold text-gray-900">{customer.project}</td>

                {/* Unit */}
                <td className="px-2 py-3 text-[11px] text-gray-600">{customer.unit}</td>

                {/* Nationality */}
                <td className="px-2 py-3 text-[11px] text-gray-600">{customer.nationality}</td>

                {/* Type */}
                <td className="px-2 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${badgeClass}`}>
                    {t(`customerTypes.${customer.customerType}` as Parameters<typeof t>[0])}
                  </span>
                </td>

                {/* Join Date */}
                <td className="px-2 py-3 text-[11px] text-gray-600">{customer.joinDate}</td>

                {/* Status */}
                <td className="px-2 py-3">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleActive(customer.id); }}
                    className="flex items-center gap-1"
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
                    onClick={(e) => { e.stopPropagation(); setAttachmentsCustomer(customer); }}
                    className="text-[10px] font-medium text-gray-900 hover:text-gray-700"
                  >
                    {t("show")}
                  </button>
                </td>

                {/* Actions */}
                <td className="px-2 py-3">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); }}
                    className="rounded-md border border-gray-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-gray-600 shadow-[0_3px_6px_-2px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-colors"
                  >
                    {t("edit")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-3">
          <span className="text-[10px] text-gray-400">
            {t("showing", { from: 1, to: customers.length, total: customers.length })}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100">
              <ChevronLeftIcon className="h-2.5 w-2.5" />
            </button>
            <button type="button" className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-[10px] font-medium text-white">
              1
            </button>
            <button type="button" className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100">
              <ChevronRightIcon className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Side panel */}
      {selectedCustomer && !editingCustomer && (
        <CustomerProfile
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEdit={() => {
            setEditingCustomer(selectedCustomer);
            setSelectedCustomer(null);
          }}
          onDelete={() => {
            setCustomers((prev) => prev.filter((c) => c.id !== selectedCustomer.id));
            setSelectedCustomer(null);
          }}
          onShowAttachments={() => {
            setAttachmentsCustomer(selectedCustomer);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* Edit modal */}
      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={() => setEditingCustomer(null)}
          onDelete={() => {
            setCustomers((prev) => prev.filter((c) => c.id !== editingCustomer.id));
            setEditingCustomer(null);
          }}
        />
      )}

      {/* Attachments modal */}
      {attachmentsCustomer && (
        <AttachmentsModal
          customer={attachmentsCustomer}
          onClose={() => setAttachmentsCustomer(null)}
        />
      )}
    </>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}
