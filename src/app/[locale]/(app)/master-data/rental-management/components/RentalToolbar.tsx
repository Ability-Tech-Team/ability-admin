"use client";

import { useTranslations } from "next-intl";
import { ImportIcon, SearchIcon } from "@/src/components/icons/ToolbarIcons";
import {
  RENTAL_STATUS_IDS,
  RESERVATION_SEARCH_FIELDS,
  WALK_IN_SEARCH_FIELDS,
  WALK_IN_SOURCE_IDS,
  WALK_IN_STATUS_IDS,
  type SearchField,
} from "@/src/services/rentals";
import type { RentalView } from "../types";
import SelectFilter from "./SelectFilter";
import type { ProjectOption } from "@/src/services/projects";

type Props = {
  view: RentalView;
  onViewChange: (view: RentalView) => void;
  searchField: SearchField;
  onSearchFieldChange: (field: SearchField) => void;
  search: string;
  onSearch: (value: string) => void;
  projectId: number | null;
  onProjectChange: (value: number | null) => void;
  projects: ProjectOption[] | null;
  projectsUnavailable: boolean;
  statusId: number | null;
  onStatusChange: (value: number | null) => void;
  sourceId: number | null;
  onSourceChange: (value: number | null) => void;
  /** Downloads the filtered reservations as a sheet; null when there is nothing to export. */
  onExport: (() => void) | null;
  /** True while that download runs. */
  exporting: boolean;
  onAdd: () => void;
};

const actionButton =
  "flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 h-7 text-[10.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white";

const views: RentalView[] = ["reservations", "walkIns"];

export default function RentalToolbar(props: Props) {
  const t = useTranslations("MasterData");
  const tRentals = useTranslations("RentalsScreen");
  const notAvailable = tRentals("notAvailableYet");
  const { view } = props;
  const fields = view === "walkIns" ? WALK_IN_SEARCH_FIELDS : RESERVATION_SEARCH_FIELDS;

  const statusOptions =
    view === "walkIns"
      ? WALK_IN_STATUS_IDS.map((id) => ({ value: id, label: tRentals(`walkInStatuses.${id}`) }))
      : RENTAL_STATUS_IDS.map((id) => ({ value: id, label: tRentals(`reservationStatuses.${id}`) }));

  return (
    <div className="flex flex-col gap-3 px-5">
      {/* Which list */}
      <div role="tablist" aria-label={tRentals("viewsLabel")} className="flex items-center gap-1">
        {views.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={view === option}
            onClick={() => props.onViewChange(option)}
            className={`rounded-md px-3 h-7 text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              view === option ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tRentals(`views.${option}`)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled title={notAvailable} className={`${actionButton} border-blue-500 text-blue-600`}>
            {t("rentalColumns.printRC")}
          </button>

          <label className="flex h-9 items-center gap-1 text-[11px] text-gray-500">
            <span>{tRentals("searchBy")}</span>
            <select
              value={props.searchField}
              onChange={(event) => {
                const field = fields.find((candidate) => candidate === event.target.value);
                if (field) props.onSearchFieldChange(field);
              }}
              className="h-7 rounded-md border border-gray-200 bg-white px-1 text-[10.5px] text-gray-600 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            >
              {fields.map((field) => (
                <option key={field} value={field}>
                  {tRentals(`searchFields.${field}`)}
                </option>
              ))}
            </select>
          </label>

          <div className="relative">
            <SearchIcon className="absolute start-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={props.search}
              onChange={(event) => props.onSearch(event.target.value)}
              placeholder={tRentals("searchPlaceholder")}
              aria-label={tRentals(`searchFields.${props.searchField}`)}
              className="h-9 w-[240px] max-w-full rounded-lg border border-gray-200 bg-white ps-7 pe-2 text-[10.5px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </div>

          <SelectFilter
            label={t("status")}
            allLabel={tRentals("allStatuses")}
            value={props.statusId}
            options={statusOptions}
            onChange={props.onStatusChange}
          />
          <SelectFilter
            label={t("filters.projects")}
            allLabel={tRentals("allProjects")}
            value={props.projectId}
            options={(props.projects ?? []).map((project) => ({ value: project.id, label: project.name }))}
            onChange={props.onProjectChange}
            disabled={props.projectsUnavailable}
            title={props.projectsUnavailable ? tRentals("projectsUnavailable") : undefined}
          />
          {view === "walkIns" && (
            <SelectFilter
              label={t("filters.source")}
              allLabel={tRentals("allSources")}
              value={props.sourceId}
              options={WALK_IN_SOURCE_IDS.map((id) => ({ value: id, label: tRentals(`walkInSources.${id}`) }))}
              onChange={props.onSourceChange}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {props.onExport ? (
            <button type="button" onClick={props.onExport} disabled={props.exporting} className={actionButton}>
              {t("export")}
            </button>
          ) : (
            <button type="button" disabled title={notAvailable} className={actionButton}>
              {t("export")}
            </button>
          )}
          <button type="button" disabled title={notAvailable} className={actionButton}>
            <ImportIcon className="h-3 w-3 text-gray-500" />
            {t("import")}
          </button>
          <button
            type="button"
            onClick={props.onAdd}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 h-7 text-[10.5px] font-medium text-white hover:bg-blue-700 transition-colors"
          >
            {t("addRental")}
          </button>
        </div>
      </div>
    </div>
  );
}
