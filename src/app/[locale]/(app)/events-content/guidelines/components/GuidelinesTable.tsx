"use client";

import { useTranslations } from "next-intl";
import Pagination from "@/src/components/Pagination";
import type { GuidelinesPage } from "@/src/services/guidelines";

type Props = {
  /** Null until the first page has loaded. */
  data: GuidelinesPage | null;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (guidelineId: number) => void;
};

// The API saves text only (no PDF), so every guideline is TEXT.
const textFormatClass = "border-blue-200 bg-blue-50 text-blue-500";

/** What the API has no field for: a category, sections, an update time. */
const noValue = <span className="text-[11px] text-gray-300">—</span>;

export default function GuidelinesTable({ data, loading, page, onPageChange, onEdit }: Props) {
  const t = useTranslations("EventsContent.guidelines");
  const tScreen = useTranslations("GuidelinesScreen");
  const guidelines = data?.guidelines ?? [];

  return (
    <div className="mx-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-start" aria-busy={loading}>
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
        <tbody className={loading && data ? "opacity-60" : undefined}>
          {guidelines.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-[12px] text-gray-400">
                {loading ? tScreen("loading") : data ? tScreen("empty") : "—"}
              </td>
            </tr>
          )}
          {guidelines.map((g) => (
            <tr
              key={g.id}
              className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="text-[12px] font-semibold text-gray-900">{g.titleEn}</div>
                <div className="text-[10px] text-gray-400">{g.titleAr}</div>
              </td>
              <td className="px-4 py-3">
                {noValue}
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-600">
                {g.projectName ?? "—"}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${textFormatClass}`}>
                  TEXT
                </span>
              </td>
              <td className="px-4 py-3 text-[12px] font-semibold text-gray-700 text-center">
                {noValue}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    g.published
                      ? "border-green-200 bg-green-50 text-green-600"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  {g.published ? t("statuses.published") : t("statuses.draft")}
                </span>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-500">
                {noValue}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onEdit(g.id)}
                  className="rounded-md border border-gray-200 px-2.5 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t("edit")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer: shown only when there is more than one page. */}
      {data && data.totalPages > 1 && (
        <div className="border-t border-gray-100 px-4">
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={onPageChange}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
