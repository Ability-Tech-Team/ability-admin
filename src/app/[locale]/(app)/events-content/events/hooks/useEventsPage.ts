"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import {
  createEvent,
  deleteEvent,
  fetchEvents,
  setEventPublished,
  updateEvent,
  type CommunityEvent,
  type EventsFilter,
} from "@/src/services/events";
import { fetchProjectOptions } from "@/src/services/projects";
import { pageAfterDelete, useContentDelete } from "../../hooks/useContentDelete";
import type { EventFormValues, EventModalState } from "../types";
import { buildEventInput, eventChanges, projectIdFromFilter, publishedFromStatusFilter } from "../utils";

export const EVENTS_PAGE_SIZE = 20;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The Events screen: the list (`GET /content/events`, searched by title and location and
 * filtered by project and publishing state on the API, a page at a time), adding
 * (`POST /content/events`) and editing an event (`PUT /content/events/:id`), publishing a draft
 * and deleting. Every save reloads the list.
 */
export function useEventsPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [search, setSearchValue] = useState("");
  const [statusFilter, setStatusValue] = useState<ReadonlySet<string>>(new Set());
  const [projectFilter, setProjectValue] = useState<ReadonlySet<string>>(new Set());
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const filter: EventsFilter = {
    search: debouncedSearch,
    projectId: projectIdFromFilter(projectFilter),
    published: publishedFromStatusFilter(statusFilter),
    page,
    limit: EVENTS_PAGE_SIZE,
  };

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: JSON.stringify(filter),
    load: ({ apiBaseUrl: base, locale }) => fetchEvents(base, filter, locale),
  });

  // The employee's projects, inactive ones too: their events still list.
  const projects = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "projects",
    load: ({ apiBaseUrl: base, locale }) => fetchProjectOptions(base, { activeOnly: false }, locale),
  });

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);
  const setStatusFilter = useCallback((selected: Set<string>) => {
    setStatusValue(selected);
    setPage(1);
  }, []);
  const setProjectFilter = useCallback((selected: Set<string>) => {
    setProjectValue(selected);
    setPage(1);
  }, []);

  const { reload } = list;

  // The form
  const [modal, setModal] = useState<EventModalState>(null);
  const save = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run: runSave, reset: resetSave } = save;

  const openCreate = useCallback(() => {
    resetSave();
    setModal({ mode: "create" });
  }, [resetSave]);
  const openEdit = useCallback(
    (eventId: number) => {
      resetSave();
      setModal({ mode: "edit", eventId });
    },
    [resetSave],
  );
  const closeModal = useCallback(() => setModal(null), []);

  /** Resolves true once saved. */
  const submitCreate = useCallback(
    async (values: EventFormValues, published: boolean) => {
      const input = buildEventInput(values, published);
      if (!input) return false;
      const saved = await runSave(async ({ apiBaseUrl: base, locale }) => {
        await createEvent(base, input, locale);
        return true;
      });
      if (saved) {
        setModal(null);
        reload();
      }
      return Boolean(saved);
    },
    [runSave, reload],
  );

  /** Resolves true once saved. */
  const submitEdit = useCallback(
    async (event: CommunityEvent, values: EventFormValues, published: boolean, locale: string) => {
      const changes = eventChanges(event, values, published, locale);
      const saved = await runSave(async ({ apiBaseUrl: base, locale: lang }) => {
        if (Object.keys(changes).length > 0) await updateEvent(base, event.id, changes, lang);
        return true;
      });
      if (saved) {
        setModal(null);
        reload();
      }
      return Boolean(saved);
    },
    [runSave, reload],
  );

  // Publishing a draft from its card
  const publishing = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run: runPublish } = publishing;
  const [publishingId, setPublishingId] = useState<number | null>(null);
  /** Resolves true once published. */
  const publish = useCallback(
    async (eventId: number) => {
      setPublishingId(eventId);
      const done = await runPublish(async ({ apiBaseUrl: base, locale }) => {
        await setEventPublished(base, eventId, true, locale);
        return true;
      });
      setPublishingId(null);
      if (done) reload();
      return Boolean(done);
    },
    [runPublish, reload],
  );

  const shown = list.data?.events.length ?? 0;
  const deletion = useContentDelete({
    apiBaseUrl,
    portalBaseUrl,
    remove: deleteEvent,
    onDeleted: () => {
      setModal(null);
      setPage(pageAfterDelete(page, shown));
      reload();
    },
  });

  const editing =
    modal?.mode === "edit" ? (list.data?.events.find((event) => event.id === modal.eventId) ?? null) : null;

  return {
    setSearch,
    setStatusFilter,
    setProjectFilter,
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
    publish,
    publishingId: publishing.pending ? publishingId : null,
    publishFailure: publishing.failure,
    deletion,
  };
}
