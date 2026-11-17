"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Project } from "@/src/services/projects";
import EditProjectModal from "./EditProjectModal";

type ProjectsTableProps = {
  data: Project[];
};

const typeBadgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";

const avatarClass = "bg-blue-100 text-blue-600";

export default function ProjectsTable({ data }: ProjectsTableProps) {
  const t = useTranslations("MasterData");
  const [projects, setProjects] = useState(data);
  const [editProject, setEditProject] = useState<Project | null>(null);

  function toggleActive(id: string) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  }

  return (
    <>
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.project")}</th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.location")}</th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.type")}</th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.units")}</th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.occupancy")}</th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.manager")}</th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const initial = project.name.charAt(0).toUpperCase();
            const barColor = project.occupancy >= 75 ? "bg-emerald-600" : "bg-orange-500";

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
                      <p className="text-[10px] text-gray-400">{project.nameAr}</p>
                    </div>
                  </div>
                </td>

                {/* Location */}
                <td className="px-4 py-3 text-[11px] text-gray-600">{project.location}</td>

                {/* Type */}
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-medium ${typeBadgeClass}`}>
                    {t(`types.${project.type}` as Parameters<typeof t>[0])}
                  </span>
                </td>

                {/* Units */}
                <td className="px-4 py-3 text-[11px] font-bold text-gray-900">{project.units.toLocaleString("en-US")}</td>

                {/* Occupancy */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${project.occupancy}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-600">{project.occupancy}%</span>
                  </div>
                </td>

                {/* Manager */}
                <td className="px-4 py-3 text-[11px] text-gray-600">{project.manager}</td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditProject(project)}
                      className="rounded-md border border-gray-200 bg-white px-3 py-1 text-[10px] font-medium text-gray-600 shadow-[0_3px_6px_-2px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-colors"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(project.id)}
                      className="flex items-center gap-1.5"
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
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <span className="text-[10px] text-gray-400">
          {t("showing", { from: 1, to: projects.length, total: projects.length })}
        </span>
        <div className="flex items-center gap-1">
          <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100">
            <ChevronLeftIcon className="h-3 w-3" />
          </button>
          <button type="button" className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[10px] font-medium text-white">
            1
          </button>
          <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100">
            <ChevronRightIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>

    {editProject && (
      <EditProjectModal
        project={editProject}
        onClose={() => setEditProject(null)}
      />
    )}
  </>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}
