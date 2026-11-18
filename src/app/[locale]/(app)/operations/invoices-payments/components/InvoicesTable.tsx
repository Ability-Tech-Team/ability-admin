"use client";

import { useTranslations } from "next-intl";
import type { Invoice } from "@/src/services/invoices";

type Props = { data: Invoice[] };

const avatarColors = [
  "bg-blue-600",
  "bg-pink-500",
  "bg-blue-500",
  "bg-indigo-600",
  "bg-emerald-500",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const invoiceTypeBadge: Record<string, string> = {
  "annual-rent": "border-blue-200 bg-blue-50 text-blue-600",
  "monthly-rent": "border-blue-200 bg-blue-50 text-blue-600",
  "service-charge": "border-blue-200 bg-blue-50 text-blue-600",
};

const statusDot: Record<string, string> = {
  overdue: "bg-red-500",
  paid: "bg-emerald-500",
  pending: "bg-yellow-500",
};

const statusBadge: Record<string, string> = {
  overdue: "border-red-300 bg-red-50 text-red-500",
  paid: "border-emerald-300 bg-emerald-50 text-emerald-600",
  pending: "border-yellow-300 bg-yellow-50 text-yellow-600",
};

function formatAmount(n: number) {
  return n.toLocaleString();
}

export default function InvoicesTable({ data }: Props) {
  const t = useTranslations("Operations");

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm mx-5">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "9%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("invoice.columns.invoiceId")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.customer")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("invoice.columns.project")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("invoice.columns.unit")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("invoice.columns.invoiceType")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("invoice.columns.amount")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.dueDate")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.status")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]" />
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const isOverdue = row.status === "overdue";

            return (
              <tr key={row.id} className="border-b border-gray-50 last:border-b-0">
                {/* Invoice ID */}
                <td className="px-4 py-2.5">
                  <span className="inline-block rounded bg-gray-50 px-2 py-0.5 text-[9.5px] text-gray-900">
                    {row.invoiceId}
                  </span>
                </td>

                {/* Customer */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${avatarColors[i % avatarColors.length]}`}
                    >
                      {getInitials(row.customer)}
                    </span>
                    <span className="text-[12px] text-gray-900">{row.customer}</span>
                  </div>
                </td>

                {/* Project */}
                <td className="px-4 py-2.5">
                  <span className="text-[12px] text-gray-900">{row.project}</span>
                </td>

                {/* Unit */}
                <td className="px-4 py-2.5">
                  <span className="text-[12px] text-gray-500">{row.unit}</span>
                </td>

                {/* Invoice Type */}
                <td className="px-4 py-2.5">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap ${invoiceTypeBadge[row.invoiceType] ?? ""}`}>
                    {t(`invoice.types.${row.invoiceType}` as Parameters<typeof t>[0])}
                  </span>
                </td>

                {/* Amount */}
                <td className="px-4 py-2.5">
                  <span className="text-[11px] font-semibold text-gray-900">
                    {row.currency} {formatAmount(row.amount)}
                  </span>
                </td>

                {/* Due Date */}
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] ${isOverdue ? "text-red-500 font-medium" : "text-gray-900"}`}>
                    {row.dueDate}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${statusBadge[row.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[row.status]}`} />
                    <span className="text-[10.5px] font-medium">
                      {t(`invoice.statuses.${row.status}` as Parameters<typeof t>[0])}
                    </span>
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <button className="text-[11px] text-blue-600 hover:text-blue-700 active:bg-blue-50 active:shadow-sm rounded px-1.5 py-0.5 transition-colors">
                      {t("invoice.actions.view")}
                    </button>
                    {row.status !== "paid" && (
                      <button className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium active:bg-emerald-50 active:shadow-sm rounded px-1.5 py-0.5 transition-colors">
                        {t("invoice.actions.markPaid")}
                      </button>
                    )}
                    <button className="text-[11px] text-gray-500 hover:text-gray-700 active:bg-gray-100 active:shadow-sm rounded px-1.5 py-0.5 transition-colors">
                      {t("invoice.actions.download")}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <span className="text-[11px] text-gray-400">
          {t("showing", { from: 1, to: data.length, total: data.length })}
        </span>
        <div className="flex items-center gap-1">
          <button className="flex h-6 w-6 items-center justify-center rounded text-[11px] text-gray-400 hover:bg-gray-50">
            ‹
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[11px] text-white">
            1
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded text-[11px] text-gray-400 hover:bg-gray-50">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
