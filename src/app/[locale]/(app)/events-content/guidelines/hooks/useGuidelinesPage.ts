"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import {
  createGuideline,
  fetchGuidelineStats,
  fetchGuidelines,
  updateGuideline,
  type GuidelineInput,
  type GuidelinesFilter,
} from "@/src/services/guidelines";
import { fetchProjectOptions } from "@/src/services/projects";
import type { GuidelineModalState } from "../types";
import { singleProjectId } from "../utils";

export const GUIDELINES_PAGE_SIZE = 20;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The guidelines list (search and one project on the API, its pages), the published and draft
 * counts, the active projects to pick from, and the new and edit forms. Every save reloads the
 * list and the counts.
 */
export function useGuidelinesPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [search, setSearchValue] = useState("");
  const [projectFilter, setProjectFilterValue] = useState<ReadonlySet<string>>(new Set());
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const filter: GuidelinesFilter = {
    search: debouncedSearch,
    projectId: singleProjectId(projectFilter),
    page,
    limit: GUIDELINES_PAGE_SIZE,
  };

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: JSON.stringify(filter),
    load: ({ apiBaseUrl: base, locale }) => fetchGuidelines(base, filter, locale),
  });

  const stats = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "guideline-stats",
    load: ({ apiBaseUrl: base, locale }) => fetchGuidelineStats(base, locale),
  });

  // The list route is Super Admin only: another role gets no project choices.
  const projects = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "active-projects",
    load: ({ apiBaseUrl: base, locale }) => fetchProjectOptions(base, { activeOnly: true }, locale),
  });

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);
  const setProjectFilter = useCallback((selected: Set<string>) => {
    setProjectFilterValue(selected);
    setPage(1);
  }, []);

  // The forms
  const [modal, setModal] = useState<GuidelineModalState>(null);
  const save = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { reset: resetSave, run: runSave } = save;

  const openCreate = useCallback(() => {
    resetSave();
    setModal({ mode: "create" });
  }, [resetSave]);
  const openEdit = useCallback(
    (guidelineId: number) => {
      resetSave();
      setModal({ mode: "edit", guidelineId });
    },
    [resetSave],
  );
  const closeModal = useCallback(() => setModal(null), []);

  const { reload: reloadList } = list;
  const { reload: reloadStats } = stats;
  const afterSave = useCallback(() => {
    setModal(null);
    reloadList();
    reloadStats();
  }, [reloadList, reloadStats]);

  /** Resolves true once saved. */
  const submitCreate = useCallback(
    async (input: GuidelineInput) => {
      const saved = await runSave(async ({ apiBaseUrl: base, locale }) => {
        await createGuideline(base, input, locale);
        return true;
      });
      if (saved) afterSave();
      return Boolean(saved);
    },
    [runSave, afterSave],
  );
  const submitEdit = useCallback(
    async (guidelineId: number, input: Partial<GuidelineInput>) => {
      const saved = await runSave(async ({ apiBaseUrl: base, locale }) => {
        await updateGuideline(base, guidelineId, input, locale);
        return true;
      });
      if (saved) afterSave();
      return Boolean(saved);
    },
    [runSave, afterSave],
  );

  const editing =
    modal?.mode === "edit"
      ? (list.data?.guidelines.find((guideline) => guideline.id === modal.guidelineId) ?? null)
      : null;

  return {
    setSearch,
    setProjectFilter,
    page,
    setPage,
    list,
    stats,
    projects,
    modal,
    editing,
    openCreate,
    openEdit,
    closeModal,
    submitCreate,
    submitEdit,
    savePending: save.pending,
    saveFailure: save.failure,
  };
}
