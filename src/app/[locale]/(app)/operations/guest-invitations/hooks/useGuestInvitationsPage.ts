"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { fetchCustomers } from "@/src/services/customers";
import {
  createGuestInvitation,
  fetchGuestInvitation,
  fetchGuestInvitationCounts,
  fetchGuestInvitations,
  setGuestInvitationActive,
} from "@/src/services/guestInvitations";
import { singleChoice } from "@/src/app/[locale]/(app)/master-data/customers/utils";
import type { CustomerUnit } from "@/src/services/customers";
import type { GuestInvitationFilters, GuestInvitationFormValues } from "../types";
import { apiStatusOf, buildCreateGuestInvitationBody, residentSearchFilters } from "../utils";

type Options = {
  /** Where the browser calls the API (`browserApiBaseUrl`), or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

/**
 * The guest invitations list: its search and status filter (applied by the API, the search
 * box debounced), the page, the counts above it, the open invitation, and the saves
 * (create, revoke, reactivate), each of which reloads what it changed.
 */
export function useGuestInvitationsPage(options: Options) {
  const { apiBaseUrl, portalBaseUrl } = options;
  const [search, setSearchValue] = useState("");
  const [exact, setExactValue] = useState(false);
  const [statusChoice, setStatusChoice] = useState<ReadonlySet<string>>(new Set());
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const filters: GuestInvitationFilters = {
    search: debouncedSearch,
    exact,
    status: apiStatusOf(singleChoice(statusChoice)),
  };
  const filtersKey = JSON.stringify(filters);

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `guest-invitations|${filtersKey}|${page}`,
    load: ({ apiBaseUrl, locale }) => fetchGuestInvitations(apiBaseUrl, filters, page, locale),
  });

  const counts = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "guest-invitation-counts",
    load: ({ apiBaseUrl, locale }) => fetchGuestInvitationCounts(apiBaseUrl, locale),
  });

  const detail = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `guest-invitation|${selectedId}`,
    enabled: selectedId !== null,
    load: ({ apiBaseUrl, locale }) => fetchGuestInvitation(apiBaseUrl, selectedId as number, locale),
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
  const setStatuses = useCallback((value: ReadonlySet<string>) => {
    setStatusChoice(value);
    setPage(1);
  }, []);

  const close = useCallback(() => setSelectedId(null), []);

  const { reload: reloadList } = list;
  const { reload: reloadCounts } = counts;
  const { reload: reloadDetail } = detail;

  const statusAction = useApiMutation(options);
  const formAction = useApiMutation(options);
  const { run: runStatus } = statusAction;
  const { run: runForm } = formAction;

  /** Revokes (`false`) or reactivates (`true`) the open invitation. Resolves true once saved. */
  const setActive = useCallback(
    async (invitationId: number, active: boolean) => {
      const done = await runStatus(({ apiBaseUrl, locale }) =>
        setGuestInvitationActive(apiBaseUrl, invitationId, active, locale).then(() => true),
      );
      if (done) {
        reloadList();
        reloadCounts();
        reloadDetail();
      }
      return Boolean(done);
    },
    [runStatus, reloadList, reloadCounts, reloadDetail],
  );

  /** Resolves with the new invitation's id, or undefined when the API refused. */
  const create = useCallback(
    async (values: GuestInvitationFormValues, unit: CustomerUnit) => {
      const invitationId = await runForm(({ apiBaseUrl, locale }) =>
        createGuestInvitation(apiBaseUrl, buildCreateGuestInvitationBody(values, unit), locale),
      );
      if (invitationId !== undefined) {
        reloadList();
        reloadCounts();
      }
      return invitationId;
    },
    [runForm, reloadList, reloadCounts],
  );

  return {
    setSearch,
    exact,
    setExact,
    setStatuses,
    /** A status filter with several ticked is ignored: the API takes one value. */
    severalTicked: statusChoice.size > 1,
    page,
    setPage,
    list,
    counts,
    selectedId,
    open: setSelectedId,
    close,
    detail,
    setActive,
    statusAction,
    create,
    formAction,
  };
}

/** The residents matching what was typed in the create form, for choosing who invites. */
export function useResidentSearch(options: Options, text: string) {
  const debounced = useDebouncedValue(text.trim());
  const filters = residentSearchFilters(debounced);
  return useApiQuery({
    apiBaseUrl: options.apiBaseUrl,
    portalBaseUrl: options.portalBaseUrl,
    key: `residents|${JSON.stringify(filters)}`,
    // Two characters at least: one would match most of the customers.
    enabled: debounced.length >= 2,
    load: ({ apiBaseUrl, locale }) => fetchCustomers(apiBaseUrl, filters, 1, locale),
  });
}
