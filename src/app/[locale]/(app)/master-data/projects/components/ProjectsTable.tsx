"use client";

import { useTranslations } from "next-intl";
import Pagination from "@/src/components/Pagination";
import { isProjectType, type ProjectsPage } from "@/src/services/projects";
import { PROJECT_TYPE_LABEL_KEYS } from "../utils";

type ProjectsTableProps = {
  /** Null until the first page has loaded. */
  data: ProjectsPage | null;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (projectId: number) => void;
  onToggleActive: (projectId: number, active: boolean) => void;
  /** The project whose status is being saved. */
  togglingId: number | null;
};

const typeBadgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";

const avatarClass = "bg-blue-100 text-blue-600";

const headClass = "px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]";

export default function ProjectsTable({
  data,
  loading,
  page,
  onPageChange,
  onEdit,
  onToggleActive,
  togglingId,
}: ProjectsTableProps) {
  const t = useTranslations("MasterData");
  const tScreen = useTranslations("ProjectsScreen");
  const projects = data?.projects ?? [];

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full" aria-busy={loading}>
        <thead>
          <tr className="border-b border-gray-100">
            <th className={`${headClass} px-5`}>{t("columns.project")}</th>
            <th className={headClass}>{t("columns.location")}</th>
            <th className={headClass}>{t("columns.type")}</th>
            <th className={headClass}>{t("columns.units")}</th>
            <th className={headClass}>{t("columns.occupancy")}</th>
            <th className={headClass}>{t("columns.manager")}</th>
            <th className={headClass}>{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody className={loading && data ? "opacity-60" : undefined}>
          {projects.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-10 text-center text-[12px] text-gray-400">
                {loading ? tScreen("loading") : data ? tScreen("empty") : "—"}
              </td>
            </tr>
          )}
          {projects.map((project) => {
            const initial = project.name.charAt(0).toUpperCase();
            const otherName = project.name === project.enName ? project.arName : project.enName;
            const occupancy = Math.min(100, Math.max(0, project.occupancy));
            const barColor = occupancy >= 75 ? "bg-emerald-600" : "bg-orange-500";
            const toggling = togglingId === project.id;

            return (
              <tr key={project.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                {/* Project */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold ${avatarClass}`}>
                      {initial}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-gray-900">{project.name}</p>
                      <p className="text-[10px] text-gray-400">{otherName}</p>
                    </div>
                  </div>
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-[11px] text-gray-600">{project.location || "—"}</td>

                {/* Type */}
                <td className="px-4 py-3">
                  {project.type ? (
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-medium ${typeBadgeClass}`}>
                      {isProjectType(project.type) ? t(PROJECT_TYPE_LABEL_KEYS[project.type]) : project.type}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-300">—</span>
                  )}
                </td>

                {/* Units */}
                <td className="px-4 py-3 text-[11px] font-bold text-gray-900">{project.totalUnits.toLocaleString()}</td>

                {/* Occupancy */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-600">{Math.round(occupancy)}%</span>
                  </div>
                </td>

                {/* Manager */}
                <td className="px-4 py-3 text-[11px] text-gray-600">{project.managerName || "—"}</td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(project.id)}
                      className="rounded-md border border-gray-200 bg-white px-3 py-1 text-[10px] font-medium text-gray-600 shadow-[0_3px_6px_-2px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-colors"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={project.active}
                      aria-label={tScreen("toggleActive", { name: project.name })}
                      disabled={togglingId !== null}
                      onClick={() => onToggleActive(project.id, !project.active)}
                      className={`flex items-center gap-1.5 disabled:cursor-wait ${toggling ? "opacity-50" : ""}`}
                    >
                      <div className={`relative h-[14px] w-[26px] rounded-full transition-colors ${project.active ? "bg-blue-500" : "bg-gray-200"}`}>
                        <div className={`absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white shadow-sm transition-all ${project.active ? "start-[14px]" : "start-[2px]"}`} />
                      </div>
                      <span className={`text-[10px] font-medium ${project.active ? "text-gray-700" : "text-gray-400"}`}>
                        {project.active ? t("active") : t("inactive")}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      {data && (
        <div className="border-t border-gray-100 px-5">
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            onPageChange={onPageChange}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
