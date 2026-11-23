"use client";

import { useCallback, useState } from "react";
import { useApiDownload } from "@/src/hooks/useApiDownload";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import {
  acceptFamilyMember,
  familyMembersSheetRequest,
  fetchFamilyMembers,
  rejectFamilyMember,
  REQUEST_STATUS_IDS,
  revertFamilyMember,
} from "@/src/services/familyMembers";
import { useProjectOptions } from "../../customers/hooks/useCustomersPage";
import { singleChoice } from "../../customers/utils";
import type { FamilyMemberFilters, FamilyMemberSearchField, RequestStatus } from "../types";

type Options = {
  /** Where the browser calls the API (`browserApiBaseUrl`), or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
};

const isStatus = (value: string | null): value is RequestStatus =>
  value !== null && Object.hasOwn(REQUEST_STATUS_IDS, value);

/**
 * The owners' requests to add relatives: the search and filters (applied by the API, the
 * search box debounced), the page, and the answers (approve, reject, revert an approval), each
 * of which reloads the list.
 */
export function useFamilyMembersPage(options: Options) {
  const { apiBaseUrl } = options;
  const exporting = useApiDownload(options);
  const [search, setSearchValue] = useState("");
  const [searchField, setSearchFieldValue] = useState<FamilyMemberSearchField>("unit");
  const [statusChoice, setStatusChoice] = useState<ReadonlySet<string>>(new Set());
  const [projectChoice, setProjectChoice] = useState<ReadonlySet<string>>(new Set());
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);
  const status = singleChoice(statusChoice);
  const project = singleChoice(projectChoice);
  const filters: FamilyMemberFilters = {
    search: debouncedSearch,
    searchField,
    status: isStatus(status) ? status : null,
    projectId: project === null ? null : Number(project),
  };
  const filtersKey = JSON.stringify(filters);

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl: options.portalBaseUrl,
    key: `relative-requests|${filtersKey}|${page}`,
    load: ({ apiBaseUrl, locale }) => fetchFamilyMembers(apiBaseUrl, filters, page, locale),
  });

  const projects = useProjectOptions(options);

  // A new filter starts again from the first page.
  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);
  const setSearchField = useCallback((value: FamilyMemberSearchField) => {
    setSearchFieldValue(value);
    setPage(1);
  }, []);
  const setStatuses = useCallback((value: ReadonlySet<string>) => {
    setStatusChoice(value);
    setPage(1);
  }, []);
  const setProjects = useCallback((value: ReadonlySet<string>) => {
    setProjectChoice(value);
    setPage(1);
  }, []);

  const action = useApiMutation(options);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const { run } = action;
  const { reload } = list;

  const answer = useCallback(
    async (requestId: number, send: (apiBaseUrl: string, locale: string) => Promise<void>) => {
      setPendingId(requestId);
      const done = await run(({ apiBaseUrl, locale }) => send(apiBaseUrl, locale).then(() => true));
      setPendingId(null);
      if (done) reload();
      return Boolean(done);
    },
    [run, reload],
  );

  const accept = useCallback(
    (requestId: number) => answer(requestId, (base, locale) => acceptFamilyMember(base, requestId, locale)),
    [answer],
  );
  const reject = useCallback(
    (requestId: number, reason: string) =>
      answer(requestId, (base, locale) => rejectFamilyMember(base, requestId, reason, locale)),
    [answer],
  );
  const revert = useCallback(
    (requestId: number) => answer(requestId, (base, locale) => revertFamilyMember(base, requestId, locale)),
    [answer],
  );

  return {
    setSearch,
    searchField,
    setSearchField,
    setStatuses,
    setProjects,
    /** A filter with several ticked is ignored: the API takes one value. */
    severalTicked: statusChoice.size > 1 || projectChoice.size > 1,
    page,
    setPage,
    list,
    projects,
    exportSheet: () => exporting.download(familyMembersSheetRequest(filters)),
    exporting,
    accept,
    reject,
    revert,
    action,
    /** The request whose answer is being saved. */
    pendingId,
  };
}
