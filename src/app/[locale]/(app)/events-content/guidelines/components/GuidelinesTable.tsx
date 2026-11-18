"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Guideline } from "@/src/services/guidelines";
import EditGuidelineModal from "./EditGuidelineModal";

type Props = {
  data: Guideline[];
  projectOptions: { value: string; label: string }[];
};

const categoryColors: Record<string, string> = {
  "community-guide": "border-blue-200 bg-blue-50 text-blue-600",
  "resident-guide": "border-green-200 bg-green-50 text-green-600",
  "facility-rules": "border-emerald-200 bg-emerald-50 text-emerald-600",
};

const formatColors: Record<string, string> = {
  pdf: "border-red-200 bg-red-50 text-red-500",
  text: "border-blue-200 bg-blue-50 text-blue-500",
};

export default function GuidelinesTable({ data, projectOptions }: Props) {
  const t = useTranslations("EventsContent.guidelines");
  const [editing, setEditing] = useState<Guideline | null>(null);

  return (
    <>
    {editing && <EditGuidelineModal guideline={editing} projectOptions={projectOptions} onClose={() => setEditing(null)} />}
    <div className="mx-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-start">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.guideline")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.category")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.project")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.format")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.sections")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.status")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.updated")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400" />
          </tr>
        </thead>
        <tbody>
          {data.map((g) => (
            <tr
              key={g.id}
              className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="text-[12px] font-semibold text-gray-900">{g.titleEn}</div>
                <div className="text-[10px] text-gray-400">{g.titleAr}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${categoryColors[g.category] ?? "border-gray-200 bg-gray-50 text-gray-500"}`}>
                  {t(`categories.${g.category}` as Parameters<typeof t>[0])}
                </span>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-600">
                {g.project}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${formatColors[g.format] ?? "border-gray-200 bg-gray-50 text-gray-500"}`}>
                  {g.format.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-3 text-[12px] font-semibold text-gray-700 text-center">
                {g.sections}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    g.status === "published"
                      ? "border-green-200 bg-green-50 text-green-600"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  {t(`statuses.${g.status}` as Parameters<typeof t>[0])}
                </span>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-500">
                {g.updated}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setEditing(g)}
                  className="rounded-md border border-gray-200 px-2.5 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t("edit")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
