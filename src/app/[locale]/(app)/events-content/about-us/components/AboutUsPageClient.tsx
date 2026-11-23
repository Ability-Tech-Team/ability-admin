"use client";

import { toast } from "sonner";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { useAboutUsPage } from "../hooks/useAboutUsPage";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  labels: {
    title: string;
    labelEn: string;
    labelAr: string;
    savePublish: string;
    saved: string;
  };
};

export default function AboutUsPageClient({ apiBaseUrl, portalBaseUrl, labels }: Props) {
  const page = useAboutUsPage({ apiBaseUrl, portalBaseUrl });
  const editable = page.loaded && !page.savePending;

  return (
    <div className="mx-5 rounded-xl bg-white p-6 shadow-sm" aria-busy={page.loading}>
      <h2 className="text-[14px] font-bold text-gray-900 mb-4">{labels.title}</h2>

      {page.loadFailure && (
        <ApiFailureNotice failure={page.loadFailure} onRetry={page.reload} className="mb-4" />
      )}

      {/* English */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[11px] font-medium text-blue-600">
          {labels.labelEn}
        </label>
        <textarea
          value={page.contentEn}
          onChange={(e) => page.setContentEn(e.target.value)}
          disabled={!editable}
          maxLength={10000}
          rows={5}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] leading-relaxed text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none disabled:bg-gray-50"
        />
      </div>

      {/* Arabic */}
      <div className="mb-5">
        <label className="mb-1.5 block text-[11px] font-medium text-blue-600">
          {labels.labelAr}
        </label>
        <textarea
          dir="rtl"
          value={page.contentAr}
          onChange={(e) => page.setContentAr(e.target.value)}
          disabled={!editable}
          maxLength={10000}
          rows={5}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] leading-relaxed text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none disabled:bg-gray-50"
        />
      </div>

      {page.saveFailure && <ApiFailureNotice failure={page.saveFailure} className="mb-4" />}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!editable}
          onClick={async () => {
            if (await page.submit()) toast.success(labels.saved);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
        >
          {labels.savePublish}
        </button>
      </div>
    </div>
  );
}
