"use client";

import { useLocale, useTranslations } from "next-intl";
import type { EventsPage } from "@/src/services/events";
import { locationIn } from "../utils";

type Props = {
  /** Null until the first page has loaded. */
  data: EventsPage | null;
  loading: boolean;
  onEdit: (eventId: number) => void;
  onPublish: (eventId: number) => void;
  /** The draft being published; every Publish button waits while one is. */
  publishingId: number | null;
  onAdd: () => void;
};

export default function EventsGrid({ data, loading, onEdit, onPublish, publishingId, onAdd }: Props) {
  const t = useTranslations("EventsContent");
  const tScreen = useTranslations("EventsScreen");
  const locale = useLocale();
  const events = data?.events ?? [];

  return (
    <div
      aria-busy={loading}
      className={`grid grid-cols-1 gap-4 px-5 md:grid-cols-2 xl:grid-cols-3 ${loading && data ? "opacity-60" : ""}`}
    >
      {events.length === 0 && (loading || data) && (
        <p className="col-span-full py-6 text-center text-[12px] text-gray-400">
          {loading ? tScreen("loading") : tScreen("empty")}
        </p>
      )}
      {events.map((event) => {
        const status = event.published ? "published" : "draft";
        return (
          <div
            key={event.id}
            className="flex min-h-[220px] flex-col rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            {/* Header banner (inset with margin): the event's image, when it has one */}
            <div
              className="mx-3 mt-3 flex h-[90px] items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 bg-cover bg-center"
              style={event.imageUrl ? { backgroundImage: `url(${JSON.stringify(event.imageUrl)})` } : undefined}
            >
              {!event.imageUrl && <span className="text-3xl">🎊</span>}
            </div>

            {/* Body */}
            <div className="flex-1 px-3 pt-2 pb-1">
              {/* Name + status */}
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <h3 className="text-[12px] font-bold text-gray-900">
                  {event.enTitle}
                </h3>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-medium ${
                    status === "published"
                      ? "border-green-200 bg-green-50 text-green-600"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  {t(`statuses.${status}`)}
                </span>
              </div>

              {/* Arabic name */}
              <p className="text-[10px] text-gray-400 mb-2">{event.arTitle}</p>

              {/* Details */}
              <div className="flex flex-col gap-1 text-[10px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-400">📅</span>
                  {tScreen("dateTime", { date: event.date, time: event.time })}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-red-400">📍</span>
                  {locationIn(event, locale) ?? "—"}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400">🏢</span>
                  {event.projectName}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 px-3 py-4">
              {/* The API keeps no RSVPs, only the capacity. */}
              <span className="text-[10px] text-gray-500">
                — / {event.capacity ?? "—"} {t("rsvps")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(event.id)}
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  {t("edit")}
                </button>
                {status === "draft" && (
                  <button
                    type="button"
                    onClick={() => onPublish(event.id)}
                    disabled={publishingId !== null}
                    className={`rounded-md bg-blue-600 px-2.5 py-1 text-[9px] font-semibold text-white hover:bg-blue-700 transition-colors disabled:cursor-wait ${
                      publishingId === event.id ? "opacity-50" : ""
                    }`}
                  >
                    {t("publish")}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Add Event card */}
      <button
        type="button"
        onClick={onAdd}
        className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="text-[12px] font-medium">{t("addEvent")}</span>
      </button>
    </div>
  );
}
