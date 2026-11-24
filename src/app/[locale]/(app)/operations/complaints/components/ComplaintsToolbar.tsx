"use client";

import { useTranslations } from "next-intl";
import { SearchIcon } from "@/src/components/icons/ToolbarIcons";
import { COMPLAINT_STATUS_IDS } from "@/src/services/complaints";
import { complaintStatusKeys, filterSelectClass, optionalId } from "../utils";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  statusId: number | null;
  onStatusChange: (value: number | null) => void;
  /** Opens New Complaint (`NewComplaintModal`). */
  onNewComplaint: () => void;
};

/**
 * The search box (a complaint number, or part of the customer's name) and the status filter,
 * both sent to the API, and New Complaint, which records one for a unit's owner.
 */
export default function ComplaintsToolbar({ search, onSearchChange, statusId, onStatusChange, onNewComplaint }: Props) {
  const t = useTranslations("Operations");
  const tc = useTranslations("ComplaintsScreen");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <SearchIcon className="absolute start-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchComplaints")}
            aria-label={t("searchComplaints")}
            className="h-9 w-[280px] max-w-full rounded-lg border border-gray-200 bg-white ps-7 pe-2 text-[10.5px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
          />
        </div>

        <select
          value={statusId ?? ""}
          onChange={(e) => onStatusChange(optionalId(e.target.value))}
          aria-label={t("status")}
          className={filterSelectClass}
        >
          <option value="">{tc("allStatuses")}</option>
          {COMPLAINT_STATUS_IDS.map((id) => (
            <option key={id} value={id}>
              {tc(`statuses.${complaintStatusKeys[id]}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onNewComplaint}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 h-7 text-[10.5px] font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {t("newComplaint")}
        </button>
      </div>
    </div>
  );
}
