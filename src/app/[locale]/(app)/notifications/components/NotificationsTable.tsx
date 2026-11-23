"use client";

import { useTranslations } from "next-intl";

/**
 * The sent notifications' table. No admin route lists what was sent (the history and its read
 * counts are gone from the API), so it shows no rows and its pager stays on an empty first page.
 */
export default function NotificationsTable() {
  const t = useTranslations("Notifications");
  const tScreen = useTranslations("NotificationsScreen");

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
          <tr>
            <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-gray-400">
              {tScreen("notAvailableYet")}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <span className="text-[11px] text-gray-400">
          {t("showing", { from: 0, to: 0, total: 0 })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            aria-label={tScreen("previousPage")}
            className="flex h-6 w-6 items-center justify-center rounded text-[11px] text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="rtl:rotate-180">&#8249;</span>
          </button>
          <button type="button" aria-current="page" className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[11px] text-white">
            1
          </button>
          <button
            type="button"
            disabled
            aria-label={tScreen("nextPage")}
            className="flex h-6 w-6 items-center justify-center rounded text-[11px] text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="rtl:rotate-180">&#8250;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
