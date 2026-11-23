"use client";

import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { searchCustomers } from "@/src/services/unitAssignments";

/** Shortest name the customer search asks the API for. */
export const CUSTOMER_SEARCH_MIN = 2;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** The project the unit is in; the search lists that project's customers. */
  projectId: number | null;
  name: string;
};

/** Customers of the project whose name contains what was typed, once typing pauses. */
export function useCustomerSearch({ apiBaseUrl, portalBaseUrl, projectId, name }: Options) {
  const debounced = useDebouncedValue(name.trim());
  const enabled = projectId !== null && debounced.length >= CUSTOMER_SEARCH_MIN;
  return useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `customers|${projectId}|${debounced}`,
    enabled,
    load: ({ apiBaseUrl: base, locale }) =>
      searchCustomers(base, { name: debounced, projectId: projectId ?? 0 }, locale),
  });
}
