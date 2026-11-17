"use client";

import { useTranslations } from "next-intl";
import type { Notification } from "@/src/services/notifications";

type Props = { data: Notification[] };

const typeStyles: Record<string, { bg: string; text: string }> = {
  announcement: { bg: "bg-blue-50", text: "text-blue-600" },
  push: { bg: "bg-emerald-50", text: "text-emerald-600" },
};

const statusStyles: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  published: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" },
  scheduled: { dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
  draft: { dot: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-300" },
};

export default function NotificationsTable({ data }: Props) {
  const t = useTranslations("Notifications");

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm mx-5">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "22%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.notification")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.type")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.project")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.audience")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.status")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.reach")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">
              {t("columns.created")}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]" />
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const tStyle = typeStyles[row.type] ?? typeStyles.announcement;
            const sStyle = statusStyles[row.status] ?? statusStyles.draft;

            return (
              <tr
                key={row.id}
                className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
              >
                {/* Notification (EN + AR) */}
                <td className="px-4 py-2.5">
                  <p className="text-[12.5px] font-medium text-gray-900">{row.titleEn}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{row.titleAr}</p>
                </td>

                {/* Type badge */}
                <td className="px-4 py-2.5">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${tStyle.bg} ${tStyle.text}`}>
                    {t(`types.${row.type}` as Parameters<typeof t>[0])}
                  </span>
                </td>

                {/* Project */}
                <td className="px-4 py-2.5 text-[12px] text-gray-900">{row.project}</td>

                {/* Audience */}
                <td className="px-4 py-2.5 text-[12px] text-gray-900">{row.audience}</td>

                {/* Status */}
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sStyle.dot}`} />
                    {t(`statuses.${row.status}` as Parameters<typeof t>[0])}
                  </span>
                </td>

                {/* Reach */}
                <td className="px-4 py-2.5 text-[11px] text-gray-500">
                  {row.status === "published" && row.sentCount !== undefined ? (
                    <>
                      {row.sentCount} {t("reach.sent")} &middot; {row.readCount} {t("reach.read")} ({row.readPercent}%)
                    </>
                  ) : row.status === "draft" ? (
                    <span className="text-gray-400">{t("reach.draft")}</span>
                  ) : (
                    <span className="text-gray-400">{row.createdAt}</span>
                  )}
                </td>

                {/* Created */}
                <td className="px-4 py-2.5 text-[12px] text-gray-500">{row.createdAt}</td>

                {/* Actions */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <button className="text-[11px] font-medium text-blue-600 hover:underline">
                      {t("actions.view")}
                    </button>
                    {row.status === "draft" && (
                      <button className="text-[11px] font-medium text-blue-600 hover:underline">
                        {t("actions.send")}
                      </button>
                    )}
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
            &#8249;
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[11px] text-white">
            1
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded text-[11px] text-gray-400 hover:bg-gray-50">
            &#8250;
          </button>
        </div>
      </div>
    </div>
  );
}
