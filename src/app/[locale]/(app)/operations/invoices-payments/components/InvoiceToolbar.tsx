"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { SearchIcon } from "@/src/components/icons/ToolbarIcons";
import {
  invoiceStatusIds,
  invoiceStatusKeys,
} from "@/src/services/invoices";
import InvoiceFilterSelect from "./InvoiceFilterSelect";
import type { ProjectOption } from "@/src/services/projects";

type Props = {
  search: string;
  isExact: boolean;
  statusId: number | null;
  projectId: number | null;
  onSearchChange: (value: string) => void;
  onExactChange: (value: boolean) => void;
  onStatusChange: (value: number | null) => void;
  onProjectChange: (value: number | null) => void;
  /** Null hides the project filter (not loaded, or the role can't list projects). */
  projectOptions: ProjectOption[] | null;
  onExport: () => void;
  exportPending: boolean;
};

const secondaryButton =
  "flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 h-7 text-[10.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

/**
 * The search box and filters (sent to the API), the export, and the actions the admin API
 * doesn't have routes for yet (shown disabled).
 */
export default function InvoiceToolbar({
  search,
  isExact,
  statusId,
  projectId,
  onSearchChange,
  onExactChange,
  onStatusChange,
  onProjectChange,
  projectOptions,
  onExport,
  exportPending,
}: Props) {
  const t = useTranslations("Operations");
  const tScreen = useTranslations("InvoicesScreen");
  const unavailableId = useId();

  const statusOptions = invoiceStatusKeys.map((key) => ({
    value: invoiceStatusIds[key],
    label: tScreen(`statuses.${key}`),
  }));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5">
      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <SearchIcon className="absolute start-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("searchInvoices")}
            aria-label={t("searchInvoices")}
            className="h-9 w-[280px] max-w-full rounded-lg border border-gray-200 bg-white ps-7 pe-2 text-[10.5px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
          />
        </div>

        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isExact}
            onChange={(event) => onExactChange(event.target.checked)}
            className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-[12px] text-gray-500">{t("exactSearch")}</span>
        </label>

        <InvoiceFilterSelect
          label={t("status")}
          allLabel={tScreen("allStatuses")}
          options={statusOptions}
          value={statusId}
          onChange={onStatusChange}
        />

        {projectOptions && projectOptions.length > 0 && (
          <InvoiceFilterSelect
            label={t("filters.projects")}
            allLabel={tScreen("allProjects")}
            options={projectOptions.map((project) => ({ value: project.id, label: project.name }))}
            value={projectId}
            onChange={onProjectChange}
          />
        )}

        {/* A project's invoice types: no admin route lists them, so the filter can't be used. */}
        {projectId !== null && (
          <InvoiceFilterSelect
            label={tScreen("invoiceType")}
            allLabel={tScreen("allTypes")}
            options={[]}
            value={null}
            onChange={() => {}}
            disabled
            title={tScreen("notAvailable")}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          disabled={exportPending}
          aria-busy={exportPending}
          className={secondaryButton}
        >
          {exportPending ? tScreen("exporting") : t("export")}
        </button>
        {/* Disabled buttons show no tooltip of their own, so the wrapper carries it. */}
        <span title={tScreen("notAvailable")}>
          <button type="button" disabled aria-describedby={unavailableId} className={secondaryButton}>
            {t("invoice.maintenanceDeposit")}
          </button>
        </span>
        <span title={tScreen("notAvailable")}>
          <button
            type="button"
            disabled
            aria-describedby={unavailableId}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 h-7 text-[10.5px] font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            {t("invoice.generateInvoice")}
          </button>
        </span>
        <span id={unavailableId} className="sr-only">
          {tScreen("notAvailable")}
        </span>
      </div>
    </div>
  );
}
