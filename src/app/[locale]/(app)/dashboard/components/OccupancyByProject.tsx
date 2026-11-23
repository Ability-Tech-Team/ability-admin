"use client";

import { useTranslations } from "next-intl";
import type { ProjectOccupancy } from "../types";
import { formatPercent } from "../utils";

type Props = {
  data: ProjectOccupancy[];
  /** Percentage below which the bar turns orange/warning. */
  warningThreshold?: number;
};

export default function OccupancyByProject({
  data,
  warningThreshold = 75,
}: Props) {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-[11px] font-semibold text-gray-800">
        {t("occupancyByProject")}
      </h2>

      {data.length === 0 && (
        <p className="text-[11px] text-gray-400">{t("noProjects")}</p>
      )}

      <div className="flex flex-col gap-3">
        {data.map((p) => {
          const isWarning = p.occupancy < warningThreshold;
          return (
            <div key={p.id} className="flex items-center gap-3">
              {/* Project name */}
              <span className="w-[100px] shrink-0 text-[11px] text-gray-500 truncate" title={p.name ?? undefined}>
                {p.name ?? t("unnamedProject")}
              </span>
              {/* Bar track */}
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isWarning ? "bg-orange-400" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, p.occupancy))}%` }}
                />
              </div>
              {/* Percentage */}
              <span className="w-[44px] text-end text-[11px] font-semibold text-gray-700">
                {formatPercent(p.occupancy)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
