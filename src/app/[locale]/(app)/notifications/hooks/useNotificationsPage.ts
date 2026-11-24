"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { fetchProjectOptions } from "@/src/services/projects";
import {
  fetchSentNotifications,
  sendNotification,
  type SendNotificationInput,
  type SentNotificationFilters,
} from "@/src/services/notifications";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * What was sent (GET /admin/notifications: searched by title and paged by the API, the search
 * box debounced), and sending a notification to a project's customers, guests, or both
 * (POST /admin/notifications). Once one is sent, the first page, where it is, loads again.
 */
export function useNotificationsPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [search, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [lastSent, setLastSent] = useState<number | null>(null);
  const send = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run, reset } = send;

  const debouncedSearch = useDebouncedValue(search);
  // The screen has no project filter, so every project the employee can reach.
  const filters: SentNotificationFilters = { search: debouncedSearch, projectId: null };

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `sent|${JSON.stringify(filters)}|${page}`,
    load: ({ apiBaseUrl: base, locale }) => fetchSentNotifications(base, filters, page, locale),
  });
  const { reload } = list;

  // The employee's active projects, loaded once the form opens.
  const projects = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "active-projects",
    enabled: modalOpen,
    load: ({ apiBaseUrl: base, locale }) => fetchProjectOptions(base, { activeOnly: true }, locale),
  });

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const openModal = useCallback(() => {
    reset();
    setModalOpen(true);
  }, [reset]);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const submit = useCallback(
    async (input: SendNotificationInput) => {
      const recipients = await run(({ apiBaseUrl: base, locale }) => sendNotification(base, input, locale));
      if (recipients !== undefined) {
        setLastSent(recipients);
        setModalOpen(false);
        setPage(1);
        reload();
      }
    },
    [run, reload],
  );

  const dismissSent = useCallback(() => setLastSent(null), []);

  return {
    search,
    setSearch,
    page,
    setPage,
    list,
    modalOpen,
    openModal,
    closeModal,
    projects,
    submit,
    pending: send.pending,
    failure: send.failure,
    lastSent,
    dismissSent,
  };
}
