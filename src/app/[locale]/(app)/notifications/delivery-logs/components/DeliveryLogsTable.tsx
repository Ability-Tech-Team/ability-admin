"use client";

import { useLocale, useTranslations } from "next-intl";
import type { SentNotificationsPage } from "@/src/services/notifications";
import {
  formatCount,
  formatPushCount,
  formatSentAt,
  pushResultsUnknown,
  readPercent,
  sentNotificationText,
} from "../../utils";

export type DeliveryLogsLabels = {
  notification: string;
  sentAt: string;
  recipients: string;
  delivered: string;
  read: string;
  failed: string;
  readRate: string;
};

type Props = {
  labels: DeliveryLogsLabels;
  /** Null until the first page has loaded (or when it couldn't). */
  data: SentNotificationsPage | null;
  loading: boolean;
};

/**
 * One row per send. Delivered and Failed are the recipients' push results; "—" when none were
 * recorded. Recipients with no phone registered aren't failures: the Failed cell's title counts them.
 */
export default function DeliveryLogsTable({ labels, data, loading }: Props) {
  const t = useTranslations("NotificationsScreen");
  const locale = useLocale();
  const rows = data?.notifications ?? [];
  const columns = [
    { key: "notification", label: labels.notification },
    { key: "sentAt", label: labels.sentAt },
    { key: "recipients", label: labels.recipients },
    { key: "delivered", label: labels.delivered },
    { key: "read", label: labels.read },
    { key: "failed", label: labels.failed },
    { key: "readRate", label: labels.readRate },
  ];

  return (
    <div className="mx-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm" aria-busy={loading}>
      <table className="w-full text-start">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2.5 text-start text-[10px] font-bold uppercase tracking-wider text-gray-600"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={loading ? "opacity-60" : ""}>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[12px] text-gray-400">
                {/* Without data and not loading, the failure notice above says why. */}
                {loading ? t("loadingHistory") : data ? t("noneSent") : "—"}
              </td>
            </tr>
          )}
          {rows.map((log) => {
            const unknown = pushResultsUnknown(log);
            const rate = readPercent(log.readCount, log.sentCount);
            const failedTitle = [
              unknown ? t("pushNotRecorded") : null,
              log.push.noDevice > 0 ? t("noDevice", { count: log.push.noDevice }) : null,
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <tr
                key={log.id}
                className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
              >
                <td className="px-4 py-3 text-[12px] font-semibold text-gray-900">
                  {sentNotificationText(log, locale).title}
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-400 font-mono">
                  {formatSentAt(log.createdAt, locale)}
                </td>
                <td className="px-4 py-3 text-[12px] font-semibold text-gray-700">
                  {formatCount(log.sentCount)}
                </td>
                <td
                  className="px-4 py-3 text-[12px] font-semibold text-green-600"
                  title={unknown ? t("pushNotRecorded") : undefined}
                >
                  {formatPushCount(log, "delivered")}
                </td>
                <td className="px-4 py-3 text-[12px] font-semibold text-blue-600">
                  {formatCount(log.readCount)}
                </td>
                <td className="px-4 py-3 text-[12px] font-semibold text-red-500" title={failedTitle || undefined}>
                  {formatPushCount(log, "failed")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${rate}%` }} />
                    </div>
                    <span className="text-[11px] font-medium text-gray-600">{rate}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
