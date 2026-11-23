"use client";

import { useTranslations } from "next-intl";
import type { ApiFailure } from "@/src/lib/apiFailure";

type Props = {
  failure: ApiFailure;
  /** Shown for retryable failures (unreachable, failed). */
  onRetry?: () => void;
  /** Wording for a reason this screen words itself, e.g. `{ forbidden: t("onlySuperAdmin") }`. */
  messages?: Partial<Record<ApiFailure["reason"], string>>;
  className?: string;
};

/**
 * Why a screen has no data (or old data), or why a save failed, with the way forward when
 * there is one. Wording is in the `ApiErrors` catalog namespace; a refusal (`rejected`)
 * shows the API's own message, which is already in the request's language.
 */
export default function ApiFailureNotice({ failure, onRetry, messages, className = "" }: Props) {
  const t = useTranslations("ApiErrors");
  const canRetry = Boolean(onRetry) && (failure.reason === "unreachable" || failure.reason === "failed");

  const text =
    messages?.[failure.reason] ??
    (failure.reason === "rejected" && failure.message ? failure.message : t(failure.reason));

  return (
    <div
      role="alert"
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800 ${className}`}
    >
      <span>{text}</span>
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
