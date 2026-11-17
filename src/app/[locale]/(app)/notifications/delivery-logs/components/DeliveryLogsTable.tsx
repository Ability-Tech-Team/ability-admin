"use client";

import type { DeliveryLog } from "@/src/services/deliveryLogs";

type Props = {
  data: DeliveryLog[];
  labels: {
    notification: string;
    sentAt: string;
    recipients: string;
    delivered: string;
    read: string;
    failed: string;
    readRate: string;
  };
};

export default function DeliveryLogsTable({ data, labels }: Props) {
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
          {data.map((log) => (
            <tr
              key={log.id}
              className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
            >
              <td className="px-4 py-3 text-[12px] font-semibold text-gray-900">
                {log.notification}
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-400 font-mono">
                {log.sentAt}
              </td>
              <td className="px-4 py-3 text-[12px] font-semibold text-gray-700">
                {log.recipients.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-[12px] font-semibold text-green-600">
                {log.delivered.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-[12px] font-semibold text-blue-600">
                {log.read.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-[12px] font-semibold text-red-500">
                {log.failed.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${log.readRate}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-gray-600">
                    {log.readRate}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
