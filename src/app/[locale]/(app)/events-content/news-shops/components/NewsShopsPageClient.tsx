"use client";

import { useTranslations } from "next-intl";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import Toolbar from "@/src/components/Toolbar";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { useNewsShopsPage } from "../hooks/useNewsShopsPage";
import NewsShopsTable from "./NewsShopsTable";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  labels: ToolbarLabels;
};

// The Toolbar's add button, which can't be disabled, drawn here instead.
const addButton =
  "flex items-center gap-1 rounded-md bg-blue-600 px-3 h-7 text-[10.5px] font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600";

export default function NewsShopsPageClient({ apiBaseUrl, portalBaseUrl, labels }: Props) {
  const tUnits = useTranslations("UnitsScreen");
  const page = useNewsShopsPage({ apiBaseUrl, portalBaseUrl });
  const { list } = page;

  return (
    <div className="flex flex-col gap-4">
      <Toolbar
        labels={{ ...labels, addLabel: "" }}
        onSearch={page.setSearch}
        trailingContent={
          // The API can create news (title, content and at least one photo or video), but the
          // screen has no form for it yet.
          <button type="button" disabled title={tUnits("notAvailableYet")} className={addButton}>
            {labels.addLabel}
          </button>
        }
      />
      {list.failure && (
        <ApiFailureNotice failure={list.failure} onRetry={list.reload} className="mx-5" />
      )}
      <NewsShopsTable
        data={list.data}
        loading={list.loading}
        page={page.page}
        onPageChange={page.setPage}
      />
    </div>
  );
}
