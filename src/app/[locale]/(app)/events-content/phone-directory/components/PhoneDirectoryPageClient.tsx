"use client";

import { useTranslations } from "next-intl";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import Toolbar from "@/src/components/Toolbar";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { usePhoneDirectoryPage } from "../hooks/usePhoneDirectoryPage";
import PhoneDirectoryGrid from "./PhoneDirectoryGrid";

type Props = {
  /** Where the browser calls the API, or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  labels: ToolbarLabels;
};

export default function PhoneDirectoryPageClient({ apiBaseUrl, portalBaseUrl, labels }: Props) {
  const notAvailable = useTranslations("UnitsScreen")("notAvailableYet");
  const page = usePhoneDirectoryPage({ apiBaseUrl, portalBaseUrl });
  const { list } = page;

  return (
    <div className="flex flex-col gap-4">
      <Toolbar
        // The add button is drawn below, disabled: the screen has no contact form yet.
        labels={{ ...labels, addLabel: "" }}
        onSearch={page.setSearch}
        trailingContent={
          <button
            type="button"
            disabled
            title={notAvailable}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 h-7 text-[10.5px] font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            {labels.addLabel}
          </button>
        }
      />
      {list.failure && (
        <div className="px-5">
          <ApiFailureNotice failure={list.failure} onRetry={list.reload} />
        </div>
      )}
      <PhoneDirectoryGrid
        data={list.data}
        loading={list.loading}
        page={page.page}
        onPageChange={page.setPage}
        editTitle={notAvailable}
      />
    </div>
  );
}
