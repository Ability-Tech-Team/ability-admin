"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

export type ProjectOverviewItem = {
  name: string;
  status: "active" | "inactive";
  units: number;
  residents: number;
  location: string;
  occupancy: number;
};

type Props = {
  data: ProjectOverviewItem[];
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

      {/* Project list */}
      <div className="flex flex-col divide-y divide-gray-50">
        {data.map((p) => (
          <div key={p.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold text-gray-500 ${avatarBg}`}
            >
              {p.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-gray-800 truncate">
                  {p.name}
                </span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                    p.status === "active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  }`}
                >
                  {p.status === "active" ? t("statusActive") : t("statusInactive")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                <span>{p.units} {t("units")}</span>
                <span>{p.residents} {t("residents")}</span>
                <span>{p.location}</span>
              </div>
            </div>

            {/* Occupancy */}
            <div className="shrink-0 text-end">
              <span className="text-[13px] font-bold text-emerald-500">
                {p.occupancy}%
              </span>
              <div className="text-[9px] text-gray-400">{t("occupancy")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
