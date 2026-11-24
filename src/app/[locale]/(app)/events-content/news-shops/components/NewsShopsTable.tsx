"use client";

import { useTranslations } from "next-intl";
import Pagination from "@/src/components/Pagination";
import { newsDisplayDate, type NewsPage } from "@/src/services/newsShops";

type Props = {
  /** Null until the first page has loaded. */
  data: NewsPage | null;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (articleId: number) => void;
};

export default function NewsShopsTable({ data, loading, page, onPageChange, onEdit }: Props) {
  const t = useTranslations("EventsContent.newsShops");
  const articles = data?.articles ?? [];

  return (
    <div className="mx-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-start" aria-busy={loading}>
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.article")}
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
        <tbody className={loading && data ? "opacity-60" : undefined}>
          {articles.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-[12px] text-gray-400">
                {loading ? t("loading") : data ? t("empty") : "—"}
              </td>
            </tr>
          )}
          {articles.map((article) => (
            <tr
              key={article.id}
              className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="text-[12px] font-semibold text-gray-900">{article.titleEn}</div>
                <div className="text-[10px] text-gray-400">{article.titleAr}</div>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-600">
                {article.project.name ?? "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    article.published
                      ? "border-green-200 bg-green-50 text-green-600"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  {t(article.published ? "statuses.published" : "statuses.draft")}
                </span>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-500">
                {newsDisplayDate(article) ?? "—"}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onEdit(article.id)}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {t("edit")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data && (
        <div className="border-t border-gray-100 px-4">
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
