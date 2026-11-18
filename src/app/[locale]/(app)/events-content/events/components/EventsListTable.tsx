"use client";

import { useTranslations } from "next-intl";
import type { CommunityEvent } from "@/src/services/events";

type Props = {
  data: CommunityEvent[];
};

export default function EventsListTable({ data }: Props) {
  const t = useTranslations("EventsContent");

  return (
    <div className="mx-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-start">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("listColumns.event")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("listColumns.project")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("listColumns.dateTime")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("listColumns.location")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("listColumns.rsvps")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("listColumns.status")}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((event) => (
            <tr
              key={event.id}
              className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="text-[12px] font-semibold text-gray-900">{event.nameEn}</div>
                <div className="text-[10px] text-gray-400">{event.nameAr}</div>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-600">
                {event.project}
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-500 font-mono">
                {event.date}
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-600">
                {event.venue}
              </td>
              <td className="px-4 py-3 text-[12px] font-bold text-gray-700">
                {event.rsvpCount}/{event.rsvpLimit}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    event.status === "published"
                      ? "border-green-200 bg-green-50 text-green-600"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  {t(`statuses.${event.status}`)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
