"use client";

import { useTranslations } from "next-intl";
import type { CommunityEvent } from "@/src/services/events";

type Props = {
  data: CommunityEvent[];
};

export default function EventsGrid({ data }: Props) {
  const t = useTranslations("EventsContent");

  return (
    <div className="grid grid-cols-1 gap-4 px-5 md:grid-cols-2 xl:grid-cols-3">
      {data.map((event) => (
        <div
          key={event.id}
          className="flex min-h-[220px] flex-col rounded-xl border border-gray-100 bg-white shadow-sm"
        >
          {/* Header banner (inset with margin) */}
          <div className="mx-3 mt-3 flex h-[90px] items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
            <span className="text-3xl">🎊</span>
          </div>

          {/* Body */}
          <div className="flex-1 px-3 pt-2 pb-1">
            {/* Name + status */}
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <h3 className="text-[12px] font-bold text-gray-900">
                {event.nameEn}
              </h3>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-medium ${
                  event.status === "published"
                    ? "border-green-200 bg-green-50 text-green-600"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                {t(`statuses.${event.status}`)}
              </span>
            </div>

            {/* Arabic name */}
            <p className="text-[10px] text-gray-400 mb-2">{event.nameAr}</p>

            {/* Details */}
            <div className="flex flex-col gap-1 text-[10px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="text-blue-400">📅</span>
                {event.date}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-red-400">📍</span>
                {event.venue}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">🏢</span>
                {event.project}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-4">
            <span className="text-[10px] text-gray-500">
              {event.rsvpCount} / {event.rsvpLimit} {t("rsvps")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                {t("edit")}
              </button>
              {event.status === "draft" && (
                <button
                  type="button"
                  className="rounded-md bg-blue-600 px-2.5 py-1 text-[9px] font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  {t("publish")}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Add Event card */}
      <button
        type="button"
        className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="text-[12px] font-medium">{t("addEvent")}</span>
      </button>
    </div>
  );
}
