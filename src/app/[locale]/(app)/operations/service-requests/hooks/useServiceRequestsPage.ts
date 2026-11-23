"use client";

import { useCallback, useState } from "react";
import { useApiDownload } from "@/src/hooks/useApiDownload";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import {
  fetchServiceRequestStats,
  fetchServiceRequests,
  serviceRequestsSheetRequest,
  type ServiceRequestFilters,
} from "@/src/services/serviceRequests";
import { fetchProjectOptions } from "@/src/services/projects";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The service requests list: its filters (searched by the API, the search box debounced), the
 * page, the counts above it, the project filter's options, which request is open, and the
 * export of every request the filters match.
 */
export function useServiceRequestsPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [search, setSearchValue] = useState("");
  const [exact, setExactValue] = useState(false);
  const [statusId, setStatusIdValue] = useState<number | null>(null);
  const [projectId, setProjectIdValue] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const filters: ServiceRequestFilters = { search: debouncedSearch, exact, statusId, projectId };
  const filtersKey = JSON.stringify(filters);

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `list|${filtersKey}|${page}`,
    load: ({ apiBaseUrl, locale }) => fetchServiceRequests(apiBaseUrl, filters, page, locale),
  });

  const stats = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `stats|${filtersKey}`,
    load: ({ apiBaseUrl, locale }) => fetchServiceRequestStats(apiBaseUrl, filters, locale),
  });

  // Super Admin only: another role gets no options, and the filter stays hidden.
  const projects = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "projects",
    load: ({ apiBaseUrl, locale }) => fetchProjectOptions(apiBaseUrl, { activeOnly: true }, locale),
  });

  // A new filter starts again from the first page.
  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);
  const setExact = useCallback((value: boolean) => {
    setExactValue(value);
    setPage(1);
  }, []);
  const setStatusId = useCallback((value: number | null) => {
    setStatusIdValue(value);
    setPage(1);
  }, []);
  const setProjectId = useCallback((value: number | null) => {
    setProjectIdValue(value);
    setPage(1);
  }, []);

  const { reload: reloadList } = list;
  const { reload: reloadStats } = stats;
  /** After a change in the detail: the row and the counts may have moved. */
  const reloadAll = useCallback(() => {
    reloadList();
    reloadStats();
  }, [reloadList, reloadStats]);

  const exporter = useApiDownload({ apiBaseUrl, portalBaseUrl });
  const exportSheet = () => {
    void exporter.download(serviceRequestsSheetRequest(filters));
  };

  return {
    exportSheet,
    exporting: exporter.pending,
    exportFailure: exporter.failure,
    search,
    setSearch,
    exact,
    setExact,
    statusId,
    setStatusId,
    projectId,
    setProjectId,
    projectOptions: projects.data ?? [],
    page,
    setPage,
    list,
    stats,
    selectedId,
    select: setSelectedId,
    reloadAll,
  };
}
