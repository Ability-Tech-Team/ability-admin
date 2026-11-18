"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Complaint } from "@/src/services/complaints";
import ComplaintDetail from "./ComplaintDetail";

type Props = { data: Complaint[] };

const priorityStyles: Record<string, string> = {
  low: "border-gray-300 text-gray-500",
  medium: "border-yellow-300 bg-yellow-50 text-yellow-700",
  high: "border-red-300 bg-red-50 text-red-600",
};

const statusStyles: Record<string, string> = {
  "in-progress": "border-blue-300 text-blue-600",
  open: "border-emerald-300 text-emerald-600",
  resolved: "border-emerald-300 text-emerald-600",
};

export default function ComplaintsTable({ data }: Props) {
  const t = useTranslations("Operations");
  const [selected, setSelected] = useState<Complaint | null>(null);

  return (
    <>
    <div className="overflow-hidden rounded-xl bg-white shadow-sm mx-5">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "9%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("complaint.columns.complaintId")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("complaint.columns.subject")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("complaint.columns.description")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.projectUnit")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("complaint.columns.submittedBy")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("complaint.columns.priority")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("complaint.columns.assignedTo")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.status")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("complaint.columns.date")}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => setSelected(row)}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(row); } }}
              className="border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 transition-colors"
            >
              {/* Complaint ID */}
              <td className="px-4 py-2.5">
                <span className="inline-block rounded bg-gray-50 px-2 py-0.5 text-[9.5px] text-gray-900">
                  {row.complaintId}
                </span>
              </td>

              {/* Subject */}
              <td className="px-4 py-2.5">
                <p className="text-[12px] font-medium text-gray-900">{row.subject}</p>
              </td>

              {/* Description */}
              <td className="px-4 py-2.5">
                <p className="text-[11px] text-gray-400 truncate">{row.description}</p>
              </td>

              {/* Project / Unit */}
              <td className="px-4 py-2.5">
                <p className="text-[12px] text-gray-900">{row.project}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{row.unit}</p>
              </td>

              {/* Submitted By */}
              <td className="px-4 py-2.5">
                <span className="text-[12px] text-gray-900">{row.submittedBy}</span>
              </td>

              {/* Priority */}
              <td className="px-4 py-2.5">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium capitalize ${priorityStyles[row.priority] ?? ""}`}
                >
                  {t(`complaint.priorities.${row.priority}` as Parameters<typeof t>[0])}
                </span>
              </td>

              {/* Assigned To */}
              <td className="px-4 py-2.5">
                <span className={`text-[12px] ${row.assignedTo === "Unassigned" ? "italic text-gray-400" : "text-gray-900"}`}>
                  {row.assignedTo}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-2.5">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap ${statusStyles[row.status] ?? ""}`}
                >
                  {t(`statuses.${row.status}` as Parameters<typeof t>[0])}
                </span>
              </td>

              {/* Date */}
              <td className="px-4 py-2.5">
                <span className="text-[11px] text-gray-500">{row.date}</span>
              </td>
            </tr>
          ))}
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
      <ComplaintDetail
        complaint={selected}
        onClose={() => setSelected(null)}
      />
    )}
    </>
  );
}
