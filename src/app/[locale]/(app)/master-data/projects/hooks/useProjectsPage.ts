"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import {
  createProject,
  fetchProjects,
  setProjectActive,
  updateProject,
  type ProjectInput,
  type ProjectsFilter,
} from "@/src/services/projects";
import type { ProjectModalState } from "../types";
import { activeFromStatusFilter } from "../utils";

export const PROJECTS_PAGE_SIZE = 20;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The projects list (search, status, paging on the API), the add and edit form, and turning a
 * project on or off. Every save reloads the list.
 */
export function useProjectsPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [search, setSearchValue] = useState("");
  const [exact, setExactValue] = useState(false);
  const [statusFilter, setStatusFilterValue] = useState<ReadonlySet<string>>(new Set());
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const filter: ProjectsFilter = {
    search: debouncedSearch,
    exact,
    active: activeFromStatusFilter(statusFilter),
    page,
    limit: PROJECTS_PAGE_SIZE,
  };

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: JSON.stringify(filter),
    load: ({ apiBaseUrl: base, locale }) => fetchProjects(base, filter, locale),
  });

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);
  const setExact = useCallback((value: boolean) => {
    setExactValue(value);
    setPage(1);
  }, []);
  const setStatusFilter = useCallback((selected: Set<string>) => {
    setStatusFilterValue(selected);
    setPage(1);
  }, []);

  // The form
  const [modal, setModal] = useState<ProjectModalState>(null);
  const save = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { reset: resetSave, run: runSave } = save;

  const openCreate = useCallback(() => {
    resetSave();
    setModal({ mode: "create" });
  }, [resetSave]);
  const openEdit = useCallback(
    (projectId: number) => {
      resetSave();
      setModal({ mode: "edit", projectId });
    },
    [resetSave],
  );
  const closeModal = useCallback(() => setModal(null), []);

  const { reload } = list;
  const submitCreate = useCallback(
    async (input: ProjectInput & { projectCode: string }) => {
      const saved = await runSave(({ apiBaseUrl: base, locale }) => createProject(base, input, locale));
      if (saved) {
        setModal(null);
        reload();
      }
    },
    [runSave, reload],
  );
  const submitEdit = useCallback(
    async (projectId: number, input: ProjectInput) => {
      const saved = await runSave(({ apiBaseUrl: base, locale }) =>
        updateProject(base, projectId, input, locale),
      );
      if (saved) {
        setModal(null);
        reload();
      }
    },
    [runSave, reload],
  );

  // Turning a project on or off
  const status = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run: runStatus } = status;
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const toggleActive = useCallback(
    async (projectId: number, active: boolean) => {
      setTogglingId(projectId);
      const saved = await runStatus(({ apiBaseUrl: base, locale }) =>
        setProjectActive(base, projectId, active, locale),
      );
      setTogglingId(null);
      if (saved) reload();
    },
    [runStatus, reload],
  );

  const editing =
    modal?.mode === "edit"
      ? (list.data?.projects.find((project) => project.id === modal.projectId) ?? null)
      : null;

  return {
    search,
    setSearch,
    setExact,
    setStatusFilter,
    page,
    setPage,
    list,
    modal,
    editing,
    openCreate,
    openEdit,
    closeModal,
    submitCreate,
    submitEdit,
    savePending: save.pending,
    saveFailure: save.failure,
    toggleActive,
    togglingId: status.pending ? togglingId : null,
    statusFailure: status.failure,
    resetStatusFailure: status.reset,
  };
}
