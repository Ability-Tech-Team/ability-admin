"use client";

import { useTranslations } from "next-intl";

type Props = {
  /** 1-based. */
  page: number;
  /** Total pages from the API; 0 or 1 hides the pager. */
  totalPages: number;
  /** Total records from the API, when it gives one. */
  totalCount?: number;
  onPageChange: (page: number) => void;
  /** True while the requested page loads: the buttons wait. */
  disabled?: boolean;
};

const button =
  "h-8 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-medium text-gray-600 transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

/** Previous / next paging for a server-paged list. */
export default function Pagination({ page, totalPages, totalCount, onPageChange, disabled = false }: Props) {
  const t = useTranslations("Pagination");
  if (totalPages <= 1 && totalCount === undefined) return null;

  return (
    <nav aria-label={t("label")} className="flex flex-wrap items-center justify-between gap-3 py-3 text-[12px] text-gray-500">
      <span>
        {totalCount !== undefined && t("total", { count: totalCount })}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button type="button" className={button} disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
            <span aria-hidden="true" className="rtl:hidden">←</span>
            <span aria-hidden="true" className="ltr:hidden">→</span> {t("previous")}
          </button>
          <span aria-live="polite">{t("pageOf", { page, totalPages })}</span>
          <button type="button" className={button} disabled={disabled || page >= totalPages} onClick={() => onPageChange(page + 1)}>
            {t("next")} <span aria-hidden="true" className="rtl:hidden">→</span>
            <span aria-hidden="true" className="ltr:hidden">←</span>
          </button>
        </div>
      )}
    </nav>
  );
}
