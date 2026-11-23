"use client";

import { useTranslations } from "next-intl";
import Pagination from "@/src/components/Pagination";
import type { ServiceRequestPage } from "@/src/services/serviceRequests";
import { initials, ticketStatusStyle } from "../utils";

type Props = {
  /** Null until the first page has loaded (or when it couldn't). */
  data: ServiceRequestPage | null;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onSelect: (id: number) => void;
};

const avatarColors = [
  "bg-blue-600",
  "bg-pink-500",
  "bg-blue-500",
  "bg-indigo-600",
  "bg-emerald-500",
];

const headerClass = "px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]";

export default function ServiceRequestsTable({ data, loading, page, onPageChange, onSelect }: Props) {
  const t = useTranslations("Operations");
  const ts = useTranslations("ServiceRequestsScreen");
  const rows = data?.requests ?? [];

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm mx-5" aria-busy={loading}>
      <table className="w-full min-w-[760px] table-fixed">
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
            <th className={headerClass}>{t("columns.requestId")}</th>
            <th className={headerClass}>{t("columns.issue")}</th>
            <th className={headerClass}>{t("detail.unit")}</th>
            <th className={headerClass}>{t("columns.customer")}</th>
            <th className={headerClass}>{t("columns.dueDate")}</th>
            <th className={headerClass}>{t("columns.status")}</th>
          </tr>
        </thead>
        <tbody className={loading ? "opacity-60" : ""}>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-gray-400">
                {/* Without data and not loading, the failure notice above says why. */}
                {loading ? ts("loading") : data ? ts("empty") : "—"}
              </td>
            </tr>
          )}
          {rows.map((row, i) => {
            const style = ticketStatusStyle(row.statusId);
            const services = row.services.map((service) => service.name ?? `#${service.id}`).join(", ");

            return (
              <tr
                key={row.id}
                onClick={() => onSelect(row.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(row.id);
                  }
                }}
                tabIndex={0}
                className="border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 focus:outline-none focus-visible:bg-blue-50/50 transition-colors"
              >
                {/* Request ID */}
                <td className="px-4 py-2.5">
                  <span className="inline-block rounded bg-gray-50 px-2 py-0.5 text-[9.5px] text-gray-900">#{row.id}</span>
                  {row.isUrgent && (
                    <span className="ms-1 inline-block rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9.5px] font-medium text-red-600">
                      {ts("urgent")}
                    </span>
                  )}
                </td>

                {/* Issue: the requested services, then the department and where it came from */}
                <td className="px-4 py-2.5">
                  <p className="truncate text-[12.5px] font-medium text-gray-900" title={services}>{services || "—"}</p>
                  <p className="truncate text-[11px] text-gray-900 mt-0.5">
                    {[row.departmentName, row.sourceName].filter(Boolean).join(" · ") || "—"}
                  </p>
                </td>

                {/* Unit */}
                <td className="px-4 py-2.5">
                  <p className="text-[12px] text-gray-900">{row.unitNumber}</p>
                  {row.unitType && <p className="text-[11px] text-gray-400 mt-0.5">{row.unitType}</p>}
                </td>

                {/* Customer */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${avatarColors[i % avatarColors.length]}`}
                    >
                      {initials(row.customerName)}
                    </span>
                    <span className="truncate text-[12px] text-gray-900">{row.customerName}</span>
                  </div>
                </td>

                {/* Arrival time; red when past its SLA */}
                <td className="px-4 py-2.5" title={row.overdueSla ? t("statusCards.overdueSla") : undefined}>
                  <p className={`text-[12px] ${row.overdueSla ? "text-red-500 font-medium" : "text-gray-900"}`}>
                    {row.arrivalDate || "—"}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${row.overdueSla ? "text-red-400" : "text-gray-400"}`}>
                    {row.arrivalTime}
                  </p>
                </td>

                {/* Status, named by the API in the page's language */}
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-block rounded-full border px-3 py-1 text-[11px] font-medium ${style.border} ${style.text}`}
                  >
                    {row.statusName ?? "—"}
                  </span>
                </td>
              </tr>
            );
          })}
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
