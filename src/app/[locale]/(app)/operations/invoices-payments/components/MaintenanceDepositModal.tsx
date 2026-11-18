"use client";

import { useTranslations } from "next-intl";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";
import type { MaintenanceDeposit } from "@/src/services/invoices";

type Props = {
  data: MaintenanceDeposit[];
  onClose: () => void;
};

function formatAmount(n: number) {
  return `EGP ${n.toLocaleString()}`;
}

export default function MaintenanceDepositModal({ data, onClose }: Props) {
  const t = useTranslations("Operations");

  return (
    <ModalWrapper onClose={onClose} width="max-w-[560px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h2 className="text-[15px] font-bold text-gray-900">
          {t("invoice.deposit.title")}
        </h2>
        <CloseButton onClick={onClose} />
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
            {data.map((row) => (
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
    </ModalWrapper>
  );
}
