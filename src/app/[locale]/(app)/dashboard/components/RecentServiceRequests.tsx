"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import type { LatestServiceRequest } from "../types";
import { describeServices } from "../utils";

type Props = {
  /** The five newest requests (`GET /admin/dashboard/latest-service-requests`). */
  data: LatestServiceRequest[];
  viewAllHref?: string;
};

/** By the backend's ticket status ids (`ticketStatusEnums`); the label is the API's own. */
const statusStyle: Record<number, string> = {
  1: "border-blue-200 bg-blue-50 text-blue-600", // created
  2: "border-sky-200 bg-sky-50 text-sky-600", // paid
  3: "border-yellow-200 bg-yellow-50 text-yellow-600", // confirmed
  4: "border-indigo-200 bg-indigo-50 text-indigo-600", // in progress
  5: "border-teal-200 bg-teal-50 text-teal-600", // fulfilled
  6: "border-emerald-200 bg-emerald-50 text-emerald-600", // done
  7: "border-red-200 bg-red-50 text-red-600", // rejected
};
const otherStatus = "border-gray-200 bg-gray-50 text-gray-600";

const th = "py-2 pe-4 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400";
const td = "py-3 pe-4 text-[11px] text-gray-500";

export default function RecentServiceRequests({
  data,
  viewAllHref = "#",
}: Props) {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[12px] font-semibold text-gray-800">
            {t("recentServiceRequests")}
          </h2>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {t("recentServiceRequestsSubtitle")}
          </p>
        </div>
        <Link
          href={viewAllHref}
          className="text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors shrink-0"
        >
          {t("viewAll")} →
        </Link>
      </div>

      {data.length === 0 ? (
        <p className="text-[11px] text-gray-400">{t("noServiceRequests")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="border-b border-gray-100">
                <th className={th}>{t("requestId")}</th>
                <th className={th}>{t("services")}</th>
                <th className={th}>{t("project")}</th>
                <th className={th}>{t("unit")}</th>
                <th className={th}>{t("customer")}</th>
                <th className={th}>{t("status")}</th>
                <th className={th}>{t("createdAt")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className={`${td} font-mono`}>#{r.id}</td>
                  <td className={`${td} text-gray-700`}>
                    {describeServices(r.services, t("unnamedService")) || "—"}
                  </td>
                  <td className={td}>{r.project.name ?? "—"}</td>
                  <td className={td}>{r.unitNumber}</td>
                  <td className={td}>{r.customerName}</td>
                  <td className="py-3 pe-4">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusStyle[r.status.id] ?? otherStatus}`}
                    >
                      {r.status.name ?? "—"}
                    </span>
                  </td>
                  <td className={`${td} font-mono whitespace-nowrap`}>{r.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
