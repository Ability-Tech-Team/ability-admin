"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import {
  createNews,
  deleteNews,
  fetchNews,
  fetchNewsArticle,
  updateNews,
  type NewsArticle,
  type NewsFilter,
} from "@/src/services/newsShops";
import { fetchProjectOptions } from "@/src/services/projects";
import { pageAfterDelete, useContentDelete } from "../../hooks/useContentDelete";
import type { NewsFormValues, NewsModalState } from "../types";
import { buildNewsChanges, buildNewsInput } from "../utils";

export const NEWS_PAGE_SIZE = 20;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The news list (search and paging on the API), the active projects to pick from, and the new
 * and edit forms, and deleting. Every save reloads the list. Editing loads the article again when its form
 * opens, so it starts from what is saved now and its file links are fresh.
 */
export function useNewsShopsPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [search, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const filter: NewsFilter = { search: debouncedSearch, page, limit: NEWS_PAGE_SIZE };

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: JSON.stringify(filter),
    load: ({ apiBaseUrl: base, locale }) => fetchNews(base, filter, locale),
  });

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  // The forms
  const [modal, setModal] = useState<NewsModalState>(null);
  /** Counts the openings, so reopening an article loads it again. */
  const [opened, setOpened] = useState(0);
  const save = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { reset: resetSave, run: runSave } = save;

  // The projects this employee can work in (GET /projects/accessible), once a form opens.
  const projects = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "active-projects",
    enabled: modal !== null,
    load: ({ apiBaseUrl: base, locale }) => fetchProjectOptions(base, { activeOnly: true }, locale),
  });

  const editingId = modal?.mode === "edit" ? modal.articleId : null;
  const article = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `news-article|${editingId}|${opened}`,
    enabled: editingId !== null,
    load: ({ apiBaseUrl: base, locale }) => fetchNewsArticle(base, editingId as number, locale),
  });
  // While another article loads, or fails to, the query still holds the previous one.
  const editing =
    !article.loading && !article.failure && article.data?.id === editingId ? article.data : null;

  const openCreate = useCallback(() => {
    resetSave();
    setModal({ mode: "create" });
  }, [resetSave]);
  const openEdit = useCallback(
    (articleId: number) => {
      resetSave();
      setOpened((count) => count + 1);
      setModal({ mode: "edit", articleId });
    },
    [resetSave],
  );
  const closeModal = useCallback(() => setModal(null), []);

  const { reload: reloadList } = list;

  /** Resolves true once saved. The newest article is first, so the list goes back to page 1. */
  const submitCreate = useCallback(
    async (values: NewsFormValues) => {
      const saved = await runSave(async ({ apiBaseUrl: base, locale }) => {
        await createNews(base, buildNewsInput(values), values.newMedia, locale);
        return true;
      });
      if (!saved) return false;
      setModal(null);
      setPage(1);
      reloadList();
      return true;
    },
    [runSave, reloadList],
  );

  /** Resolves true once saved (or when nothing changed). */
  const submitEdit = useCallback(
    async (current: NewsArticle, values: NewsFormValues) => {
      const changes = buildNewsChanges(current, values);
      if (changes) {
        const saved = await runSave(async ({ apiBaseUrl: base, locale }) => {
          await updateNews(base, current.id, changes, locale);
          return true;
        });
        if (!saved) return false;
        reloadList();
      }
      setModal(null);
      return true;
    },
    [runSave, reloadList],
  );

  const shown = list.data?.articles.length ?? 0;
  const deletion = useContentDelete({
    apiBaseUrl,
    portalBaseUrl,
    remove: deleteNews,
    onDeleted: () => {
      setModal(null);
      setPage(pageAfterDelete(page, shown));
      reloadList();
    },
  });

  return {
    setSearch,
    page,
    setPage,
    list,
    projects,
    modal,
    editing,
    articleFailure: editingId !== null ? article.failure : null,
    reloadArticle: article.reload,
    openCreate,
    openEdit,
    closeModal,
    submitCreate,
    submitEdit,
    savePending: save.pending,
    saveFailure: save.failure,
    deletion,
  };
}
