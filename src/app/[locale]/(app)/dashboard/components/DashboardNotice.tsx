"use client";

import { useTranslations } from "next-intl";
import type { DashboardFailure } from "../types";

type Props = {
  failure: DashboardFailure;
  onRetry: () => void;
};

/** Why the dashboard has no figures (or old ones), with the way forward when there is one. */
export default function DashboardNotice({ failure, onRetry }: Props) {
  const t = useTranslations("Dashboard.errors");
  const canRetry = failure.reason === "unreachable" || failure.reason === "failed";

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800"
    >
      <span>{t(failure.reason)}</span>
      {failure.reason === "sessionEnded" && failure.signInUrl && (
        <a
          href={failure.signInUrl}
          className="rounded-lg bg-white px-3 py-1.5 font-semibold text-amber-800 shadow-sm hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {t("signInAgain")}
        </a>
      )}
      {canRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-white px-3 py-1.5 font-semibold text-amber-800 shadow-sm hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {t("retry")}
        </button>
      )}
    </div>
  );
}
