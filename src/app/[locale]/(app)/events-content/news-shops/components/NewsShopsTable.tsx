"use client";

import { useTranslations } from "next-intl";
import type { Article } from "@/src/services/newsShops";

type Props = {
  data: Article[];
};

const categoryColors: Record<string, string> = {
  facilities: "border-blue-200 bg-blue-50 text-blue-600",
  announcement: "border-amber-200 bg-amber-50 text-amber-600",
  maintenance: "border-green-200 bg-green-50 text-green-600",
};

export default function NewsShopsTable({ data }: Props) {
  const t = useTranslations("EventsContent.newsShops");

  return (
    <div className="mx-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-start">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.article")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.category")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.project")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.status")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.date")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400" />
          </tr>
        </thead>
        <tbody>
          {data.map((article) => (
            <tr
              key={article.id}
              className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="text-[12px] font-semibold text-gray-900">{article.titleEn}</div>
                <div className="text-[10px] text-gray-400">{article.titleAr}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium capitalize ${categoryColors[article.category] ?? "border-gray-200 bg-gray-50 text-gray-500"}`}>
                  {t(`categories.${article.category}` as Parameters<typeof t>[0])}
                </span>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-600">
                {article.project}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    article.status === "published"
                      ? "border-green-200 bg-green-50 text-green-600"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  {t(`statuses.${article.status}` as Parameters<typeof t>[0])}
                </span>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-500">
                {article.date}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {t("edit")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
