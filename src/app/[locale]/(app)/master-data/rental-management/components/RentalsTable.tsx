"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Rental } from "@/src/services/rentals";
import RentalDetail from "./RentalDetail";

type RentalsTableProps = {
  data: Rental[];
};

const idBadgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";

const statusClass: Record<string, string> = {
  pending: "border border-yellow-300 bg-yellow-50 text-yellow-600",
  approved: "border border-green-300 bg-green-50 text-green-600",
  rejected: "border border-red-300 bg-red-50 text-red-600",
};

export default function RentalsTable({ data }: RentalsTableProps) {
  const t = useTranslations("MasterData");
  const [statusOverrides, setStatusOverrides] = useState<Map<string, Rental["status"]>>(new Map());
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

  const rentals = useMemo(() =>
    data.map((r) => {
      const newStatus = statusOverrides.get(r.id);
      return newStatus ? { ...r, status: newStatus } : r;
    }),
    [data, statusOverrides]
  );

  function updateStatus(id: string, status: "approved" | "rejected") {
    setStatusOverrides((prev) => new Map(prev).set(id, status));
  }

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "6.5%" }} />
          <col style={{ width: "10.5%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "8.5%" }} />
          <col style={{ width: "10.5%" }} />
          <col style={{ width: "7.5%" }} />
          <col style={{ width: "7.5%" }} />
          <col style={{ width: "8.5%" }} />
          <col style={{ width: "6.5%" }} />
          <col style={{ width: "7.5%" }} />
          <col style={{ width: "16.5%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-3 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("rentalColumns.rentalId")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("rentalColumns.unit")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("rentalColumns.tenantName")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("rentalColumns.idPassportType")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("rentalColumns.idPassport")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("rentalColumns.start")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("rentalColumns.end")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("rentalColumns.annualRent")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("rentalColumns.source")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.status")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {rentals.map((rental) => (
            <tr key={rental.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-3 py-4 text-[11px] text-gray-900">{rental.rentalId}</td>
              <td className="px-2 py-4 text-[11px] text-gray-900">{rental.project} - {rental.unit}</td>
              <td className="px-2 py-4 text-[11px] text-gray-900">{rental.tenantName}</td>
              <td className="px-2 py-4">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize ${idBadgeClass}`}>
                  {t(`idTypes.${rental.idType}` as Parameters<typeof t>[0])}
                </span>
              </td>
              <td className="px-2 py-4 text-[11px] text-gray-900">{rental.idNumber}</td>
              <td className="px-2 py-4 text-[11px] text-gray-600">{rental.startDate}</td>
              <td className="px-2 py-4 text-[11px] text-gray-600">{rental.endDate}</td>
              <td className="px-2 py-4 text-[11px] text-gray-900">{rental.annualRent}</td>
              <td className="px-2 py-4 text-[11px] text-gray-900">{rental.source}</td>
              <td className="px-2 py-4">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusClass[rental.status]}`}>
                  {t(`familyColumns.statuses.${rental.status}` as Parameters<typeof t>[0])}
                </span>
              </td>
              <td className="px-2 py-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRental(rental)}
                    className="rounded-md px-2.5 py-1 text-[11px] font-medium text-gray-700 active:bg-gray-100 active:shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    {t("view")}
                  </button>
                  {rental.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateStatus(rental.id, "approved")}
                        className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        {t("familyColumns.approve")}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(rental.id, "rejected")}
                        className="rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-600 transition-colors"
                      >
                        {t("familyColumns.reject")}
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-3">
        <span className="text-[10px] text-gray-400">
          {t("showing", { from: 1, to: rentals.length, total: rentals.length })}
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

      {/* Detail side panel */}
      {selectedRental && (
        <RentalDetail
          rental={selectedRental}
          onClose={() => setSelectedRental(null)}
        />
      )}
    </div>
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
