"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ServiceRequest } from "@/src/services/serviceRequests";
import ServiceRequestDetail from "./ServiceRequestDetail";

type Props = { data: ServiceRequest[] };

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

const statusStyles: Record<string, { border: string; text: string }> = {
  "in-progress": { border: "border-blue-300", text: "text-blue-600" },
  open: { border: "border-emerald-300", text: "text-emerald-600" },
  resolved: { border: "border-emerald-300", text: "text-emerald-600" },
  delayed: { border: "border-red-300", text: "text-red-500" },
};

export default function ServiceRequestsTable({ data }: Props) {
  const t = useTranslations("Operations");
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm mx-5">
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: "12%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
                {t("columns.requestId")}
              </th>
              <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
                {t("columns.issue")}
              </th>
              <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
                {t("columns.projectUnit")}
              </th>
              <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
                {t("columns.customer")}
              </th>
              <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
                {t("columns.dueDate")}
              </th>
              <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
                {t("columns.status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const style = statusStyles[row.status] ?? statusStyles.open;
              const isOverdue = row.status !== "resolved";

              return (
                <tr
                  key={row.id}
                  onClick={() => setSelected(row)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(row); } }}
                  className="border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  {/* Request ID */}
                  <td className="px-4 py-2.5">
                    <span className="inline-block rounded bg-gray-50 px-2 py-0.5 text-[9.5px] text-gray-900">{row.requestId}</span>
                  </td>

                  {/* Issue */}
                  <td className="px-4 py-2.5">
                    <p className="text-[12.5px] font-medium text-gray-900">{row.title}</p>
                    <p className="text-[11px] text-gray-900 mt-0.5">
                      {row.category} · {row.subcategory}
                    </p>
                  </td>

                  {/* Project / Unit */}
                  <td className="px-4 py-2.5">
                    <p className="text-[12px] text-gray-900">{row.project}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{row.unit}</p>
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

                  {/* Due Date */}
                  <td className="px-4 py-2.5">
                    <p className={`text-[12px] ${isOverdue ? "text-red-500 font-medium" : "text-gray-900"}`}>
                      {row.dueDate}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${isOverdue ? "text-red-400" : "text-gray-400"}`}>
                      {row.dueTime}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block rounded-full border px-3 py-1 text-[11px] font-medium ${style.border} ${style.text}`}
                    >
                      {t(`statuses.${row.status}` as Parameters<typeof t>[0])}
                    </span>
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

      {selected && (
        <ServiceRequestDetail
          request={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
