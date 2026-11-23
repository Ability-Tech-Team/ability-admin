"use client";

import { useLocale, useTranslations } from "next-intl";
import type { TopService } from "../types";
import { formatMonth, formatNumber } from "../utils";

type Props = {
  /** Up to five services, most requested first; every one lists the same months. */
  data: TopService[];
};

const BAR_HEIGHT = 120;
const COLORS = ["bg-blue-400", "bg-emerald-400", "bg-amber-400", "bg-purple-400", "bg-rose-400"];

/** The most requested services, month by month (`GET /admin/dashboard/top-services`). */
export default function TopServicesChart({ data }: Props) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();

  const months = data[0]?.monthly.map((entry) => entry.month) ?? [];
  const withYear = months.length > 0 && months[0].slice(0, 4) !== months[months.length - 1].slice(0, 4);
  const max = Math.max(1, ...data.flatMap((service) => service.monthly.map((entry) => entry.requests)));

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm min-w-0">
      {/* Header + legend */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-[12px] font-semibold text-gray-800">{t("topServices")}</h2>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {data.map((service, index) => (
            <li key={service.id} className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${COLORS[index % COLORS.length]}`} />
              {service.name ?? t("unnamedService")} ({formatNumber(service.totalRequests)})
            </li>
          ))}
        </ul>
      </div>

      {data.length === 0 ? (
        <p className="flex items-center justify-center text-[11px] text-gray-400" style={{ height: BAR_HEIGHT }}>
          {t("noServiceRequests")}
        </p>
      ) : (
        <div className="flex items-end gap-3 overflow-x-auto">
          {months.map((month, monthIndex) => (
            <div key={month} className="flex min-w-[48px] flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-end justify-center gap-0.5" style={{ height: BAR_HEIGHT }}>
                {data.map((service, index) => {
                  const requests = service.monthly[monthIndex]?.requests ?? 0;
                  const label = `${service.name ?? t("unnamedService")}: ${formatNumber(requests)} ${t("requests")}`;
                  return (
                    <div
                      key={service.id}
                      role="img"
                      aria-label={label}
                      title={label}
                      className={`flex-1 max-w-[18px] rounded-t-sm ${COLORS[index % COLORS.length]}`}
                      style={{ height: Math.round((requests / max) * BAR_HEIGHT) }}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] text-gray-400">{formatMonth(month, locale, withYear)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
