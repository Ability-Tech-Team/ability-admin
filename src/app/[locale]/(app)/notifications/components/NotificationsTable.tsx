"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  SENT_NOTIFICATIONS_PAGE_SIZE,
  type SentNotificationsPage,
} from "@/src/services/notifications";
import { formatReach, formatSentAt, sentNotificationText } from "../utils";

type Props = {
  /** Null until the first page has loaded (or when it couldn't). */
  data: SentNotificationsPage | null;
  loading: boolean;
  /** 1-based. */
  page: number;
  onPageChange: (page: number) => void;
};

// Every entry is a sent announcement (GET /admin/notifications lists nothing else), so the
// type and status badges keep the design's announcement and published styles.
const typeStyle = { bg: "bg-blue-50", text: "text-blue-600" };
const statusStyle = { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" };

/** What was sent from the dashboard, one row per send, newest first. */
export default function NotificationsTable({ data, loading, page, onPageChange }: Props) {
  const t = useTranslations("Notifications");
  const tScreen = useTranslations("NotificationsScreen");
  const locale = useLocale();
  const rows = data?.notifications ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const from = rows.length > 0 ? (page - 1) * SENT_NOTIFICATIONS_PAGE_SIZE + 1 : 0;
  const to = rows.length > 0 ? from + rows.length - 1 : 0;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm mx-5" aria-busy={loading}>
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
        <tbody className={loading ? "opacity-60" : ""}>
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-gray-400">
                {/* Without data and not loading, the failure notice above says why. */}
                {loading ? tScreen("loadingHistory") : data ? tScreen("noneSent") : "—"}
              </td>
            </tr>
          )}
          {rows.map((row) => {
            const text = sentNotificationText(row, locale);
            return (
              <tr
                key={row.id}
                className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
              >
                {/* Notification: title and body in the page's language */}
                <td className="px-4 py-2.5">
                  <p className="truncate text-[12.5px] font-medium text-gray-900" title={text.title}>
                    {text.title}
                  </p>
                  <p className="truncate text-[11px] text-gray-400 mt-0.5" title={text.body}>
                    {text.body}
                  </p>
                </td>

                {/* Type badge */}
                <td className="px-4 py-2.5">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                    {t("types.announcement")}
                  </span>
                </td>

                {/* Project */}
                <td className="px-4 py-2.5 text-[12px] text-gray-900">{row.projectName ?? "—"}</td>

                {/* Audience */}
                <td className="px-4 py-2.5 text-[12px] text-gray-900">{tScreen(`targets.${row.audience}`)}</td>

                {/* Status: only sent notifications exist (no drafts or scheduled ones) */}
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                    {t("statuses.published")}
                  </span>
                </td>

                {/* Reach: recipients, and how many have read it */}
                <td className="px-4 py-2.5 text-[11px] text-gray-500">
                  {formatReach(row, { sent: t("reach.sent"), read: t("reach.read") })}
                </td>

                {/* Created: when, and by whom */}
                <td className="px-4 py-2.5 text-[12px] text-gray-500">
                  {formatSentAt(row.createdAt, locale)}
                  {row.sentByName && <p className="text-[11px] text-gray-400 mt-0.5">{row.sentByName}</p>}
                </td>

                {/* Actions: none (there is no route for one sent notification) */}
                <td className="px-4 py-2.5" />
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <span className="text-[11px] text-gray-400">
          {t("showing", { from, to, total: totalCount })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={loading || page <= 1}
            aria-label={tScreen("previousPage")}
            className="flex h-6 w-6 items-center justify-center rounded text-[11px] text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="rtl:rotate-180">&#8249;</span>
          </button>
          <button type="button" aria-current="page" className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[11px] text-white">
            {page}
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={loading || page >= totalPages}
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
