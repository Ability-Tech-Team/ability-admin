"use client";

import { useTranslations } from "next-intl";
import type { AuditLogEntry } from "@/src/services/auditLog";

type Props = {
  data: AuditLogEntry[];
};

export default function AuditLogTable({ data }: Props) {
  const t = useTranslations("AuditLog");

  return (
    <div className="mx-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-start">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.timestamp")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.action")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.module")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.user")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.detail")}
            </th>
            <th className="px-4 py-2.5 text-end text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.ipAddress")}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
            >
              <td className="px-4 py-3 text-[11px] text-gray-500 whitespace-nowrap">
                {entry.timestamp}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${entry.actionColor}`}>
                  {entry.action}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${entry.moduleBadgeColor}`}
                >
                  {entry.module}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${entry.userInitialsColor}`}
                  >
                    {entry.userInitials}
                  </div>
                  <span className="text-[11px] font-medium text-gray-800">
                    {entry.userName}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-600 max-w-[300px] truncate">
                {entry.detail}
              </td>
              <td className="px-4 py-3 text-end text-[11px] text-gray-400 font-mono">
                {entry.ipAddress}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
        <span className="text-[11px] text-gray-400">
          {t("showing", { from: 1, to: data.length, total: data.length })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] text-gray-400"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-[11px] font-medium text-white"
          >
            1
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] text-gray-400"
          >
            &rsaquo;
          </button>
        </div>
      </div>
    </div>
  );
}
