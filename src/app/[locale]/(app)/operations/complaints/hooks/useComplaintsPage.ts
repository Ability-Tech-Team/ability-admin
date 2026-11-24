"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import {
  addComplaintResponse,
  changeComplaintStatus,
  fetchComplaints,
  type Complaint,
  type ComplaintFilters,
} from "@/src/services/complaints";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The complaints list (filtered and paged by the API, the search box debounced), the open
 * complaint, and its saves: a response to the customer and a status change. There is no
 * route for one complaint, so the open one is refreshed from the reloaded list. New Complaint
 * (`NewComplaintModal`) saves on its own; once it has, the first page, where the newest
 * complaint is, loads again.
 */
export function useComplaintsPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [search, setSearchValue] = useState("");
  const [statusId, setStatusIdValue] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [opened, setOpened] = useState<Complaint | null>(null);
  const [creating, setCreating] = useState(false);

  const debouncedSearch = useDebouncedValue(search);
  const filters: ComplaintFilters = { search: debouncedSearch, statusId };

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `list|${JSON.stringify(filters)}|${page}`,
    load: ({ apiBaseUrl, locale }) => fetchComplaints(apiBaseUrl, filters, page, locale),
  });

  const mutation = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run, reset } = mutation;
  const { reload } = list;

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);
  const setStatusId = useCallback((value: number | null) => {
    setStatusIdValue(value);
    setPage(1);
  }, []);

  const select = useCallback(
    (complaint: Complaint | null) => {
      reset();
      setOpened(complaint);
    },
    [reset],
  );

  // The reloaded row when the list still has it; otherwise the copy that was opened.
  const selected = opened
    ? (list.data?.complaints.find((complaint) => complaint.id === opened.id) ?? opened)
    : null;

  const openNewComplaint = useCallback(() => setCreating(true), []);
  const closeNewComplaint = useCallback(() => setCreating(false), []);
  const complaintCreated = useCallback(() => {
    setCreating(false);
    setPage(1);
    reload();
  }, [reload]);

  /** Resolves true when the response was saved. */
  const addResponse = useCallback(
    async (id: number, response: string) => {
      const saved = await run(async ({ apiBaseUrl, locale }) => {
        await addComplaintResponse(apiBaseUrl, id, response, locale);
        return true;
      });
      if (saved) reload();
      return Boolean(saved);
    },
    [run, reload],
  );

  /** Resolves true when the status was changed. */
  const changeStatus = useCallback(
    async (id: number, nextStatusId: number) => {
      const saved = await run(async ({ apiBaseUrl, locale }) => {
        await changeComplaintStatus(apiBaseUrl, id, nextStatusId, locale);
        return true;
      });
      if (saved) reload();
      return Boolean(saved);
    },
    [run, reload],
  );

  return {
    search,
    setSearch,
    statusId,
    setStatusId,
    page,
    setPage,
    list,
    selected,
    select,
    addResponse,
    changeStatus,
    creating,
    openNewComplaint,
    closeNewComplaint,
    complaintCreated,
    saving: mutation.pending,
    saveFailure: mutation.failure,
  };
}
