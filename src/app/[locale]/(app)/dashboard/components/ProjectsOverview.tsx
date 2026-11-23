"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import type { ProjectOccupancy } from "../types";
import { formatNumber, formatPercent } from "../utils";

type Props = {
  /** The API's active projects (`GET /admin/dashboard/occupancy`). */
  data: ProjectOccupancy[];
  viewAllHref?: string;
};

const avatarBg = "bg-[#f1f5f9]";

export default function ProjectsOverview({
  data,
  viewAllHref = "/master-data/projects",
}: Props) {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[12px] font-semibold text-gray-800">
          {t("projectsOverview")}
        </h2>
        <Link
          href={viewAllHref}
          className="text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
        >
          {t("viewAll")} →
        </Link>
      </div>

      {data.length === 0 && (
        <p className="text-[11px] text-gray-400">{t("noProjects")}</p>
      )}

      {/* Project list */}
      <div className="flex flex-col divide-y divide-gray-50">
        {data.map((p) => {
          const name = p.name ?? t("unnamedProject");
          return (
            <div key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              {/* Avatar */}
              <div
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold text-gray-500 ${avatarBg}`}
              >
                {name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className="block text-[12px] font-semibold text-gray-800 truncate">
                  {name}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                  <span>{formatNumber(p.totalUnits)} {t("units")}</span>
                  <span>{formatNumber(p.occupiedUnits)} {t("occupiedUnits")}</span>
                  <span>{formatNumber(p.residents)} {t("residents")}</span>
                </div>
              </div>

              {/* Occupancy */}
              <div className="shrink-0 text-end">
                <span className="text-[13px] font-bold text-emerald-500">
                  {formatPercent(p.occupancy)}
                </span>
                <div className="text-[9px] text-gray-400">{t("occupancy")}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
