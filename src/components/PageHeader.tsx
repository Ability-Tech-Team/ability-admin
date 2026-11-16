"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  /** Controlled date range — the backend decides the defaults. */
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  /** An optional action on the right (e.g. "Widgets"). */
  action?: React.ReactNode;
};

export default function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  action,
}: PageHeaderProps) {
  const t = useTranslations("PageHeader");

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between px-5 py-4">
      {/* Left: breadcrumb + title + subtitle */}
      <div className="flex flex-col gap-0.5">
        {/* Breadcrumb */}
        <nav aria-label={t("breadcrumb")} className="flex items-center gap-1.5 text-[13px] text-gray-500">
          {breadcrumbs.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRightIcon className="h-3 w-3 text-gray-300 rtl:rotate-180" />
              )}
              {item.href ? (
                <Link href={item.href} className="hover:text-blue-600 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </span>
          ))}
        </nav>

        <h1 className="text-lg font-extrabold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-gray-500">{subtitle}</p>
        )}
      </div>

      {/* Right: date range + action */}
      <div className="flex flex-wrap items-center gap-3 mt-3 sm:mt-0">
        {/* From */}
        {(dateFrom !== undefined || onDateFromChange) && (
          <div className="flex flex-col gap-0.5">
            <label className="text-[11px] font-medium text-gray-400">
              {t("from")}
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateFrom ?? ""}
                onChange={(e) => onDateFromChange?.(e.target.value)}
                className="h-7 w-[130px] rounded-md border border-gray-200 bg-white px-2 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
          </div>
        )}

        {/* To */}
        {(dateTo !== undefined || onDateToChange) && (
          <div className="flex flex-col gap-0.5">
            <label className="text-[11px] font-medium text-gray-400">
              {t("to")}
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateTo ?? ""}
                onChange={(e) => onDateToChange?.(e.target.value)}
                className="h-7 w-[130px] rounded-md border border-gray-200 bg-white px-2 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>
          </div>
        )}

        {action}
      </div>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
