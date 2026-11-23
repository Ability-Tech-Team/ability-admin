"use client";

import { useTranslations } from "next-intl";

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
};

/** The logs' columns over an empty body: no admin route lists the sends or their push results. */
export default function DeliveryLogsTable({ labels }: Props) {
  const t = useTranslations("NotificationsScreen");
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
    <div className="mx-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
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
        <tbody>
          <tr>
            <td colSpan={columns.length} className="px-4 py-8 text-center text-[12px] text-gray-400">
              {t("notAvailableYet")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
