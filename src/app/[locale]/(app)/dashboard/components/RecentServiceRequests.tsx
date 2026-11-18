"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

export type ServiceRequestItem = {
  requestId: string;
  title: string;
  project: string;
  customer: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "open" | "in progress" | "resolved" | "pending";
  sla: string;
};

type Props = {
  data: ServiceRequestItem[];
  viewAllHref?: string;
};

const priorityDot: Record<string, string> = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-400",
  Low: "bg-gray-300",
};

const statusStyle: Record<string, string> = {
  open: "border-blue-200 bg-blue-50 text-blue-600",
  "in progress": "border-indigo-200 bg-indigo-50 text-indigo-600",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-600",
  pending: "border-yellow-200 bg-yellow-50 text-yellow-600",
};

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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-start">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-2 pe-4 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {t("requestId")}
              </th>
              <th className="py-2 pe-4 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {t("srTitle")}
              </th>
              <th className="py-2 pe-4 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {t("project")}
              </th>
              <th className="py-2 pe-4 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {t("customer")}
              </th>
              <th className="py-2 pe-4 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {t("priority")}
              </th>
              <th className="py-2 pe-4 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {t("status")}
              </th>
              <th className="py-2 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {t("sla")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.requestId} className="border-b border-gray-50 last:border-0">
                <td className="py-3 pe-4 text-[11px] font-mono text-gray-500">
                  {r.requestId}
                </td>
                <td className="py-3 pe-4 text-[11px] text-gray-700">
                  {r.title}
                </td>
                <td className="py-3 pe-4 text-[11px] text-gray-500">
                  {r.project}
                </td>
                <td className="py-3 pe-4 text-[11px] text-gray-500">
                  {r.customer}
                </td>
                <td className="py-3 pe-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span className={`h-2 w-2 rounded-full ${priorityDot[r.priority]}`} />
                    {t(`priorities.${r.priority}` as Parameters<typeof t>[0])}
                  </span>
                </td>
                <td className="py-3 pe-4">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusStyle[r.status]}`}
                  >
                    {t(`srStatuses.${r.status}` as Parameters<typeof t>[0])}
                  </span>
                </td>
                <td className="py-3 text-[11px] font-mono text-gray-500">
                  {r.sla}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
