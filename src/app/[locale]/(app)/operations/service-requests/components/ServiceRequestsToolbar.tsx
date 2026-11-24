"use client";

import { useTranslations } from "next-intl";
import { SearchIcon } from "@/src/components/icons/ToolbarIcons";
import { TICKET_STATUS_IDS } from "@/src/services/serviceRequests";
import { filterSelectClass, optionalId, ticketStatusKeys } from "../utils";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  exact: boolean;
  onExactChange: (value: boolean) => void;
  statusId: number | null;
  onStatusChange: (value: number | null) => void;
  extraFilters?: React.ReactNode;
  /** Downloads every request the filters match. */
  onExport: () => void;
  exporting: boolean;
  /** Opens New Request. */
  onNewRequest: () => void;
};

/**
 * Search, exact search and the status filter, all sent to the API (one status at a time:
 * `status_id` takes one). Export downloads every matching request (`is_excel=1`); New Request
 * opens the form (`POST /orders/tickets`).
 */
export default function ServiceRequestsToolbar({
  search,
  onSearchChange,
  exact,
  onExactChange,
  statusId,
  onStatusChange,
  extraFilters,
  onExport,
  exporting,
  onNewRequest,
}: Props) {
  const t = useTranslations("Operations");
  const ts = useTranslations("ServiceRequestsScreen");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <SearchIcon className="absolute start-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchRequests")}
            aria-label={t("searchRequests")}
            className="h-9 w-[280px] max-w-full rounded-lg border border-gray-200 bg-white ps-7 pe-2 text-[10.5px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
          />
        </div>

        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={exact}
            onChange={(e) => onExactChange(e.target.checked)}
            className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-[12px] text-gray-500">{t("exactSearch")}</span>
        </label>

        <select
          value={statusId ?? ""}
          onChange={(e) => onStatusChange(optionalId(e.target.value))}
          aria-label={t("status")}
          className={filterSelectClass}
        >
          <option value="">{ts("allStatuses")}</option>
          {TICKET_STATUS_IDS.map((id) => (
            <option key={id} value={id}>
              {ts(`statuses.${ticketStatusKeys[id]}`)}
            </option>
          ))}
        </select>

        {extraFilters}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          aria-busy={exporting || undefined}
          className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 h-7 text-[10.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:cursor-wait disabled:opacity-50"
        >
          {t("export")}
        </button>
        <button
          type="button"
          onClick={onNewRequest}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 h-7 text-[10.5px] font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {t("newRequest")}
        </button>
      </div>
    </div>
  );
}
