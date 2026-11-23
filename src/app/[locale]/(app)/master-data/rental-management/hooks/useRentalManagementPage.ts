"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import {
  RESERVATION_SEARCH_FIELDS,
  WALK_IN_SEARCH_FIELDS,
  acceptWalkInRequest,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  extendReservation,
  fetchReservation,
  fetchReservations,
  fetchWalkInRequest,
  fetchWalkInRequests,
  rejectWalkInRequest,
  terminateReservation,
  type ReservationFilter,
  type SearchField,
  type WalkInFilter,
} from "@/src/services/rentals";
import { parsePenalty, rentalDialogProblem, type RentalDialogProblem } from "../schema";
import type { RentalDialog, RentalDialogValues, RentalView } from "../types";
import { fetchProjectOptions } from "@/src/services/projects";

export const RENTALS_PAGE_SIZE = 20;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The Rental Management screen: reservations or walk-in requests, searched one field at a
 * time and filtered by project, status (and source for requests), a page at a time; the
 * selected row's details; and the actions the API offers on them.
 */
export function useRentalManagementPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [view, setViewValue] = useState<RentalView>("reservations");
  const [searchField, setSearchFieldValue] = useState<SearchField>("customer_name");
  const [search, setSearchValue] = useState("");
  const [projectId, setProjectIdValue] = useState<number | null>(null);
  const [statusId, setStatusIdValue] = useState<number | null>(null);
  const [sourceId, setSourceIdValue] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const reservationFilter: ReservationFilter = { searchField, search: debouncedSearch, projectId, statusId };
  const walkInFilter: WalkInFilter = { ...reservationFilter, sourceId };

  const reservations = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    enabled: view === "reservations",
    key: JSON.stringify({ reservationFilter, page }),
    load: ({ apiBaseUrl: base, locale }) =>
      fetchReservations(base, reservationFilter, page, RENTALS_PAGE_SIZE, locale),
  });

  const walkIns = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    enabled: view === "walkIns",
    key: JSON.stringify({ walkInFilter, page }),
    load: ({ apiBaseUrl: base, locale }) =>
      fetchWalkInRequests(base, walkInFilter, page, RENTALS_PAGE_SIZE, locale),
  });

  const projects = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "projects",
    load: ({ apiBaseUrl: base, locale }) => fetchProjectOptions(base, { activeOnly: false }, locale),
  });

  // ---- Filters ----

  const setView = useCallback((next: RentalView) => {
    setViewValue(next);
    // Each list has its own statuses and search fields.
    setStatusIdValue(null);
    setSourceIdValue(null);
    setSearchFieldValue((field) =>
      (next === "walkIns" ? WALK_IN_SEARCH_FIELDS : RESERVATION_SEARCH_FIELDS).includes(field)
        ? field
        : "customer_name",
    );
    setPage(1);
  }, []);

  const resetPage =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setPage(1);
    };

  // ---- Details ----

  const [selected, setSelected] = useState<{ view: RentalView; id: number } | null>(null);

  const reservationDetail = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    enabled: selected?.view === "reservations",
    key: `reservation-${selected?.id ?? ""}`,
    load: ({ apiBaseUrl: base, locale }) =>
      selected ? fetchReservation(base, selected.id, locale) : Promise.reject(new Error("Nothing selected")),
  });

  const walkInDetail = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    enabled: selected?.view === "walkIns",
    key: `walk-in-${selected?.id ?? ""}`,
    load: ({ apiBaseUrl: base, locale }) =>
      selected ? fetchWalkInRequest(base, selected.id, locale) : Promise.reject(new Error("Nothing selected")),
  });

  // ---- Actions ----

  const [dialog, setDialog] = useState<RentalDialog | null>(null);
  const [dialogProblem, setDialogProblem] = useState<RentalDialogProblem | null>(null);
  const action = useApiMutation({ apiBaseUrl, portalBaseUrl });

  const openDialog = useCallback(
    (next: RentalDialog) => {
      setDialog(next);
      setDialogProblem(null);
      action.reset();
    },
    [action],
  );

  const closeDialog = useCallback(() => {
    if (action.pending) return;
    setDialog(null);
  }, [action.pending]);

  const submitDialog = useCallback(
    async (values: RentalDialogValues) => {
      if (!dialog) return;
      const problem = rentalDialogProblem(dialog.mode, values);
      setDialogProblem(problem);
      if (problem) return;
      const { id } = dialog.target;
      const penalty = parsePenalty(values.penalty);
      const penaltyAmount = penalty === "invalid" ? null : penalty;
      const done = await action.run(async ({ apiBaseUrl: base, locale }) => {
        switch (dialog.mode) {
          case "checkIn":
            await checkInReservation(base, id, locale);
            break;
          case "cancel":
            await cancelReservation(base, id, locale);
            break;
          case "extend":
            await extendReservation(base, id, values.newEndDate, locale);
            break;
          case "checkOut":
            await checkOutReservation(base, id, { tenantRating: Number(values.rating), penaltyAmount }, locale);
            break;
          case "terminate":
            await terminateReservation(base, id, { reason: values.reason, penaltyAmount }, locale);
            break;
          case "accept":
            await acceptWalkInRequest(base, id, locale);
            break;
          case "reject":
            await rejectWalkInRequest(base, id, values.reason, locale);
            break;
        }
        return true;
      });
      if (!done) return;
      setDialog(null);
      if (dialog.mode === "accept" || dialog.mode === "reject") {
        walkIns.reload();
        if (selected?.view === "walkIns") walkInDetail.reload();
      } else {
        reservations.reload();
        if (selected?.view === "reservations") reservationDetail.reload();
      }
    },
    [dialog, action, walkIns, walkInDetail, reservations, reservationDetail, selected],
  );

  // ---- New rental ----

  const [addOpen, setAddOpen] = useState(false);

  const list = view === "reservations" ? reservations : walkIns;

  return {
    view,
    setView,
    searchField,
    setSearchField: resetPage(setSearchFieldValue),
    search,
    setSearch: resetPage(setSearchValue),
    projectId,
    setProjectId: resetPage(setProjectIdValue),
    statusId,
    setStatusId: resetPage(setStatusIdValue),
    sourceId,
    setSourceId: resetPage(setSourceIdValue),
    page,
    setPage,
    /** The filter the export link uses: the one the list shows. */
    reservationFilter,
    reservations,
    walkIns,
    list,
    projects,
    selected,
    select: setSelected,
    reservationDetail,
    walkInDetail,
    dialog,
    dialogProblem,
    openDialog,
    closeDialog,
    submitDialog,
    actionPending: action.pending,
    actionFailure: action.failure,
    addOpen,
    setAddOpen,
    reloadReservations: reservations.reload,
  };
}
