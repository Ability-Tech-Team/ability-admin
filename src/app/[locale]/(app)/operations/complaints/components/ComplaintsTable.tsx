"use client";

import { useTranslations } from "next-intl";
import Pagination from "@/src/components/Pagination";
import type { Complaint, ComplaintPage } from "@/src/services/complaints";
import { complaintStatusStyle, datePart } from "../utils";

type Props = {
  /** Null until the first page has loaded (or when it couldn't). */
  data: ComplaintPage | null;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onSelect: (complaint: Complaint) => void;
};

const headerClass = "px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]";

export default function ComplaintsTable({ data, loading, page, onPageChange, onSelect }: Props) {
  const t = useTranslations("Operations");
  const tc = useTranslations("ComplaintsScreen");
  const rows = data?.complaints ?? [];

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm mx-5" aria-busy={loading}>
      <table className="w-full min-w-[900px] table-fixed">
        <colgroup>
          <col style={{ width: "9%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className={headerClass}>{t("complaint.columns.complaintId")}</th>
            <th className={headerClass}>{t("complaint.columns.subject")}</th>
            <th className={headerClass}>{t("complaint.columns.description")}</th>
            <th className={headerClass}>{t("detail.unit")}</th>
            <th className={headerClass}>{t("complaint.columns.submittedBy")}</th>
            <th className={headerClass}>{t("detail.type")}</th>
            <th className={headerClass}>{tc("department")}</th>
            <th className={headerClass}>{t("columns.status")}</th>
            <th className={headerClass}>{t("complaint.columns.date")}</th>
          </tr>
        </thead>
        <tbody className={loading ? "opacity-60" : ""}>
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-[12px] text-gray-400">
                {/* Without data and not loading, the failure notice above says why. */}
                {loading ? tc("loading") : data ? tc("empty") : "—"}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onSelect(row)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(row);
                }
              }}
              tabIndex={0}
              className="border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 focus:outline-none focus-visible:bg-blue-50/50 transition-colors"
            >
              {/* Complaint ID */}
              <td className="px-4 py-2.5">
                <span className="inline-block rounded bg-gray-50 px-2 py-0.5 text-[9.5px] text-gray-900">
                  #{row.id}
                </span>
              </td>

              {/* Subject: the title when there is one, else the complaint's type */}
              <td className="px-4 py-2.5">
                <p className="truncate text-[12px] font-medium text-gray-900">{row.title ?? row.typeName ?? "—"}</p>
              </td>

              {/* Description */}
              <td className="px-4 py-2.5">
                <p className="text-[11px] text-gray-400 truncate" title={row.details}>{row.details}</p>
              </td>

              {/* Unit */}
              <td className="px-4 py-2.5">
                <p className="text-[12px] text-gray-900">{row.unitNumber}</p>
              </td>

              {/* Submitted By: the customer */}
              <td className="px-4 py-2.5">
                <span className="text-[12px] text-gray-900">{row.customerName}</span>
              </td>

              {/* Type */}
              <td className="px-4 py-2.5">
                <span className="inline-block rounded-full border border-gray-300 px-2.5 py-0.5 text-[10.5px] font-medium text-gray-500">
                  {row.typeName ?? "—"}
                </span>
              </td>

              {/* Department */}
              <td className="px-4 py-2.5">
                <span className={`text-[12px] ${row.departmentName ? "text-gray-900" : "italic text-gray-400"}`}>
                  {row.departmentName ?? "—"}
                </span>
              </td>

              {/* Status, named by the API in the page's language */}
              <td className="px-4 py-2.5">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap ${complaintStatusStyle(row.statusId)}`}
                >
                  {row.statusName ?? "—"}
                </span>
              </td>

              {/* Date */}
              <td className="px-4 py-2.5">
                <span className="text-[11px] text-gray-500">{datePart(row.createdAt)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      {data && (
        <div className="border-t border-gray-100 px-4">
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            onPageChange={onPageChange}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
