"use client";

import { useLocale, useTranslations } from "next-intl";
import type { EventsPage } from "@/src/services/events";
import { locationIn } from "../utils";

type Props = {
  /** Null until the first page has loaded. */
  data: EventsPage | null;
  loading: boolean;
};

export default function EventsListTable({ data, loading }: Props) {
  const t = useTranslations("EventsContent");
  const tScreen = useTranslations("EventsScreen");
  const locale = useLocale();
  const events = data?.events ?? [];

  return (
    <div className="mx-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-start" aria-busy={loading}>
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
        <tbody className={loading && data ? "opacity-60" : undefined}>
          {events.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-[12px] text-gray-400">
                {loading ? tScreen("loading") : data ? tScreen("empty") : "—"}
              </td>
            </tr>
          )}
          {events.map((event) => {
            const status = event.published ? "published" : "draft";
            return (
              <tr
                key={event.id}
                className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="text-[12px] font-semibold text-gray-900">{event.enTitle}</div>
                  <div className="text-[10px] text-gray-400">{event.arTitle}</div>
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-600">
                  {event.projectName}
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-500 font-mono">
                  {tScreen("dateTime", { date: event.date, time: event.time })}
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-600">
                  {locationIn(event, locale) ?? "—"}
                </td>
                {/* The API keeps no RSVPs, only the capacity. */}
                <td className="px-4 py-3 text-[12px] font-bold text-gray-700">
                  —/{event.capacity ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      status === "published"
                        ? "border-green-200 bg-green-50 text-green-600"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                  >
                    {t(`statuses.${status}`)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
