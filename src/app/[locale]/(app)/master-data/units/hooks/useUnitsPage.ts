"use client";

import { useCallback, useState } from "react";
import { useApiDownload } from "@/src/hooks/useApiDownload";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { fetchProjectOptions } from "@/src/services/projects";
import {
  fetchUnits,
  setUnitActive,
  unitsExportRequest,
  type Unit,
  type UnitsFilter,
} from "@/src/services/units";
import { activeFromStatusFilter } from "../utils";

export const UNITS_PAGE_SIZE = 20;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The Units screen: every unit of the reachable projects (`GET /projects/units?all_units=1`), searched
 * by unit number and filtered by project and status on the API, a page at a time; the status
 * switch (`PUT /projects/units/:id`) and the export (`is_excel=1`). Add Unit has its own hook
 * (`useAddUnitForm`); its project choice comes from `projects` here.
 */
export function useUnitsPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [search, setSearchValue] = useState("");
  const [exact, setExactValue] = useState(false);
  const [projectId, setProjectIdValue] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusValue] = useState<ReadonlySet<string>>(new Set());
  const [page, setPage] = useState(1);
  const unitNumber = useDebouncedValue(search);

  const filter: UnitsFilter = { projectId, unitNumber, exact, active: activeFromStatusFilter(statusFilter) };

  const units = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: JSON.stringify({ filter, page }),
    load: ({ apiBaseUrl: base, locale }) => fetchUnits(base, filter, page, UNITS_PAGE_SIZE, locale),
  });

  // Every project, inactive ones too: their units still list.
  const projects = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "projects",
    load: ({ apiBaseUrl: base, locale }) => fetchProjectOptions(base, { activeOnly: false }, locale),
  });

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);
  const setExact = useCallback((value: boolean) => {
    setExactValue(value);
    setPage(1);
  }, []);
  const setProjectId = useCallback((value: number | undefined) => {
    setProjectIdValue(value);
    setPage(1);
  }, []);
  const setStatusFilter = useCallback((selected: Set<string>) => {
    setStatusValue(selected);
    setPage(1);
  }, []);

  const { reload } = units;

  // The status switch
  const toggle = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run: runToggle } = toggle;
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const toggleActive = useCallback(
    async (unit: Unit) => {
      setTogglingId(unit.id);
      const done = await runToggle(async ({ apiBaseUrl: base, locale }) => {
        await setUnitActive(base, unit.id, !unit.isActive, locale);
        return true;
      });
      setTogglingId(null);
      if (done) reload();
    },
    [runToggle, reload],
  );

  // Export: every unit matching the filters (not just this page)
  const exporter = useApiDownload({ apiBaseUrl, portalBaseUrl });
  const exportUnits = () => {
    void exporter.download(unitsExportRequest(filter));
  };

  return {
    setSearch,
    setExact,
    projectId,
    setProjectId,
    setStatusFilter,
    page,
    setPage,
    units,
    projects,
    toggleActive,
    /** The unit whose status is being changed; every switch waits while one is. */
    togglingId,
    toggleFailure: toggle.failure,
    exportUnits,
    exporting: exporter.pending,
    exportFailure: exporter.failure,
  };
}
