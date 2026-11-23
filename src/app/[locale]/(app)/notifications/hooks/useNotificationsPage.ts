"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { fetchProjectOptions } from "@/src/services/projects";
import { sendNotification, type SendNotificationInput } from "@/src/services/notifications";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * Sending a notification to a project's customers, guests, or both (POST /admin/notifications).
 * No admin route lists what was sent, so the screen has no history to load.
 */
export function useNotificationsPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [modalOpen, setModalOpen] = useState(false);
  const [lastSent, setLastSent] = useState<number | null>(null);
  const send = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run, reset } = send;

  // Active projects, loaded once the form opens. The list route is Super Admin only.
  const projects = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: "active-projects",
    enabled: modalOpen,
    load: ({ apiBaseUrl: base, locale }) => fetchProjectOptions(base, { activeOnly: true }, locale),
  });

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
      }
    },
    [run],
  );

  const dismissSent = useCallback(() => setLastSent(null), []);

  return {
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
