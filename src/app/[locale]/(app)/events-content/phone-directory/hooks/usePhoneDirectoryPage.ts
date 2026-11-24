"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import {
  createPhoneContact,
  deletePhoneContact,
  fetchPhoneDirectory,
  updatePhoneContact,
  type PhoneContact,
  type PhoneDirectoryFilter,
} from "@/src/services/phoneDirectory";
import { fetchProjectOptions } from "@/src/services/projects";
import { pageAfterDelete, useContentDelete } from "../../hooks/useContentDelete";
import type { PhoneContactFormValues, PhoneContactModalState } from "../types";
import { buildContactChanges, buildContactInput } from "../utils";

export const PHONE_DIRECTORY_PAGE_SIZE = 20;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The phone directory: the search (names and number) and the pages, on the API, the active
 * projects to pick from, the add and edit forms, and deleting. Every save reloads the list.
 */
export function usePhoneDirectoryPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [search, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const filter: PhoneDirectoryFilter = {
    search: debouncedSearch,
    page,
    limit: PHONE_DIRECTORY_PAGE_SIZE,
  };

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: JSON.stringify(filter),
    load: ({ apiBaseUrl: base, locale }) => fetchPhoneDirectory(base, filter, locale),
  });

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  // The forms
  const [modal, setModal] = useState<PhoneContactModalState>(null);
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

  const openCreate = useCallback(() => {
    resetSave();
    setModal({ mode: "create" });
  }, [resetSave]);
  const openEdit = useCallback(
    (contactId: number) => {
      resetSave();
      setModal({ mode: "edit", contactId });
    },
    [resetSave],
  );
  const closeModal = useCallback(() => setModal(null), []);

  const { reload: reloadList } = list;

  /** Resolves true once saved. */
  const submitCreate = useCallback(
    async (values: PhoneContactFormValues) => {
      const saved = await runSave(async ({ apiBaseUrl: base, locale }) => {
        await createPhoneContact(base, buildContactInput(values), locale);
        return true;
      });
      if (!saved) return false;
      setModal(null);
      reloadList();
      return true;
    },
    [runSave, reloadList],
  );

  /** Resolves true once saved (or when nothing changed). */
  const submitEdit = useCallback(
    async (contact: PhoneContact, values: PhoneContactFormValues) => {
      const changes = buildContactChanges(contact, values);
      if (changes) {
        const saved = await runSave(async ({ apiBaseUrl: base, locale }) => {
          await updatePhoneContact(base, contact.id, changes, locale);
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

  const shown = list.data?.contacts.length ?? 0;
  const deletion = useContentDelete({
    apiBaseUrl,
    portalBaseUrl,
    remove: deletePhoneContact,
    onDeleted: () => {
      setModal(null);
      setPage(pageAfterDelete(page, shown));
      reloadList();
    },
  });

  const editing =
    modal?.mode === "edit"
      ? (list.data?.contacts.find((contact) => contact.id === modal.contactId) ?? null)
      : null;

  return {
    setSearch,
    page,
    setPage,
    list,
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
    deletion,
  };
}
