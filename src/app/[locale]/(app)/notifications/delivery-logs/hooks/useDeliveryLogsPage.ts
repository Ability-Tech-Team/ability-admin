"use client";

import { useState } from "react";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { fetchSentNotifications } from "@/src/services/notifications";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * The delivery logs: every send in the projects the employee can reach (GET /admin/notifications),
 * newest first and paged by the API, with its recipients, reads and push results.
 */
export function useDeliveryLogsPage({ apiBaseUrl, portalBaseUrl }: Options) {
  const [page, setPage] = useState(1);

  const list = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `delivery-logs|${page}`,
    load: ({ apiBaseUrl: base, locale }) =>
      fetchSentNotifications(base, { search: "", projectId: null }, page, locale),
  });

  return { page, setPage, list };
}
