"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { fetchProjectOptions } from "@/src/services/projects";
import {
  assignUnitToCustomer,
  cairoToday,
  endOwnership,
  fetchUnitAssignment,
  fetchUnitAssignments,
  type AssignUnitInput,
  type UnitAssignment,
  type UnitAssignmentsFilter,
} from "@/src/services/unitAssignments";
import { activeFromStatusFilter, ownershipFromFilter } from "../utils";

export const ASSIGNMENTS_PAGE_SIZE = 20;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * Unit assignments: the list (search, project, occupancy type, status and paging on the API),
 * the detail panel, and assigning a unit to a customer.
 */
export function useUnitAssignmentPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [search, setSearchValue] = useState("");
  const [exact, setExactValue] = useState(false);
  const [projectId, setProjectIdValue] = useState<number | undefined>(undefined);
  const [occupancyFilter, setOccupancyValue] = useState<ReadonlySet<string>>(new Set());
  const [statusFilter, setStatusValue] = useState<ReadonlySet<string>>(new Set());
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const filter: UnitAssignmentsFilter = {
    search: debouncedSearch,
    exact,
    projectId,
    ownershipId: ownershipFromFilter(occupancyFilter),
    active: activeFromStatusFilter(statusFilter),
    page,
    limit: ASSIGNMENTS_PAGE_SIZE,
  };

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: JSON.stringify(filter),
    load: ({ apiBaseUrl: base, locale }) => fetchUnitAssignments(base, filter, locale),
  });

  // Every project, inactive ones too: their assignments still list.
  const projects = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "project-options",
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
  const setOccupancyFilter = useCallback((selected: Set<string>) => {
    setOccupancyValue(selected);
    setPage(1);
  }, []);
  const setStatusFilter = useCallback((selected: Set<string>) => {
    setStatusValue(selected);
    setPage(1);
  }, []);

  // The detail panel
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const detail = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `assignment|${selectedId}`,
    enabled: selectedId !== null,
    load: ({ apiBaseUrl: base, locale }) => fetchUnitAssignment(base, selectedId ?? 0, locale),
  });
  const closeDetail = useCallback(() => setSelectedId(null), []);

  // Assigning a unit
  const [assignOpen, setAssignOpen] = useState(false);
  const assign = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run: runAssign, reset: resetAssign } = assign;
  const openAssign = useCallback(() => {
    resetAssign();
    setAssignOpen(true);
  }, [resetAssign]);
  const closeAssign = useCallback(() => setAssignOpen(false), []);
  const { reload } = list;
  const submitAssign = useCallback(
    async (input: AssignUnitInput) => {
      const savedId = await runAssign(({ apiBaseUrl: base, locale }) =>
        assignUnitToCustomer(base, input, locale),
      );
      if (savedId !== undefined) {
        setAssignOpen(false);
        reload();
      }
    },
    [runAssign, reload],
  );

  // Ending an owner's assignment (the row's status switch), from today
  const end = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run: runEnd } = end;
  const [endingId, setEndingId] = useState<number | null>(null);
  const endAssignment = useCallback(
    async (assignment: UnitAssignment) => {
      setEndingId(assignment.id);
      const ended = await runEnd(({ apiBaseUrl: base, locale }) =>
        endOwnership(base, assignment, cairoToday(), locale),
      );
      setEndingId(null);
      if (ended !== undefined) reload();
    },
    [runEnd, reload],
  );

  const selected = list.data?.assignments.find((assignment) => assignment.id === selectedId) ?? null;
  // The query keeps its last answer while the next loads: never show another assignment's.
  const detailData = detail.data?.id === selectedId ? detail.data : null;

  return {
    setSearch,
    setExact,
    projectId,
    setProjectId,
    setOccupancyFilter,
    setStatusFilter,
    page,
    setPage,
    list,
    projects,
    selectedId,
    selected,
    select: setSelectedId,
    closeDetail,
    detail: { ...detail, data: detailData },
    assignOpen,
    openAssign,
    closeAssign,
    submitAssign,
    assignPending: assign.pending,
    assignFailure: assign.failure,
    endAssignment,
    /** The assignment being ended, while its request runs. */
    endingId,
    endFailure: end.failure,
  };
}
