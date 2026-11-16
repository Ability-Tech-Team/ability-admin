"use client";

import { useTranslations } from "next-intl";

export type ServiceRequestMonth = {
  month: string;
  open: number;
  resolved: number;
};

type Props = {
  data: ServiceRequestMonth[];
};

const BAR_HEIGHT = 120;

export default function ServiceRequestChart({ data }: Props) {
  const t = useTranslations("Dashboard");

  const max = Math.max(...data.flatMap((d) => [d.open, d.resolved]), 1);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm min-w-0">
      {/* Header + legend */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-[12px] font-semibold text-gray-800">
          {t("serviceRequestTrend")}
        </h2>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-200" />
            {t("open")}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
            {t("resolved")}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-3">
        {data.map((d) => (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
            {/* Bars side by side */}
            <div
              className="flex items-end justify-center gap-1 w-full"
              style={{ height: BAR_HEIGHT }}
            >
              <div
                className="group relative flex-1 max-w-[55px] rounded-t-md bg-blue-200 cursor-pointer"
                style={{ height: Math.round((d.open / max) * BAR_HEIGHT) }}
              >
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {t("open")}: {d.open}
                </span>
              </div>
              <div
                className="group relative flex-1 max-w-[55px] rounded-t-md bg-emerald-400 cursor-pointer"
                style={{ height: Math.round((d.resolved / max) * BAR_HEIGHT) }}
              >
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {t("resolved")}: {d.resolved}
                </span>
              </div>
            </div>
            {/* Month label */}
            <span className="text-[10px] text-gray-400">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
