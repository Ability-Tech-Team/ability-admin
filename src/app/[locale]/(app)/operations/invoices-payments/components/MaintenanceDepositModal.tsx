"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

type Props = {
  onClose: () => void;
};

const mockData = [
  { unit: "301", current: 20000, required: 25000, difference: 5000 },
  { unit: "502", current: 15000, required: 20000, difference: 5000 },
];

function formatAmount(n: number) {
  return `EGP ${n.toLocaleString("en-US")}`;
}

export default function MaintenanceDepositModal({ onClose }: Props) {
  const t = useTranslations("Operations");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="w-[560px] rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="text-[15px] font-bold text-gray-900">
              {t("invoice.deposit.title")}
            </h2>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="px-6">
            {/* Upload area */}
            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-5 text-center">
              <p className="text-[13px] font-semibold text-gray-900">
                {t("invoice.deposit.uploadTitle")}
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                {t("invoice.deposit.uploadDescription")}
              </p>
              <div className="mt-3">
                <input type="file" className="text-[11px] text-gray-500" accept=".csv,.xlsx,.xls" />
              </div>
            </div>

            {/* Table */}
            <table className="mt-4 w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 text-start text-[11px] font-semibold text-gray-500">
                    {t("invoice.deposit.unitNumber")}
                  </th>
                  <th className="py-2 text-start text-[11px] font-semibold text-gray-500">
                    {t("invoice.deposit.currentDeposit")}
                  </th>
                  <th className="py-2 text-start text-[11px] font-semibold text-gray-500">
                    {t("invoice.deposit.requiredDeposit")}
                  </th>
                  <th className="py-2 text-start text-[11px] font-semibold text-gray-500">
                    {t("invoice.deposit.difference")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((row) => (
                  <tr key={row.unit} className="border-b border-gray-50 last:border-b-0">
                    <td className="py-2.5 text-[12px] text-gray-900">{row.unit}</td>
                    <td className="py-2.5 text-[12px] text-gray-900">{formatAmount(row.current)}</td>
                    <td className="py-2.5 text-[12px] text-gray-900">{formatAmount(row.required)}</td>
                    <td className="py-2.5 text-[12px] font-semibold text-gray-900">{formatAmount(row.difference)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 pt-5 pb-5">
            <button className="rounded-lg border border-gray-200 px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              {t("invoice.deposit.downloadTemplate")}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t("invoice.deposit.cancel")}
              </button>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors">
                {t("invoice.deposit.uploadSheet")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
