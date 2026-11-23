"use client";

import { useCallback, useState } from "react";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { fetchPhoneDirectory, type PhoneDirectoryFilter } from "@/src/services/phoneDirectory";

export const PHONE_DIRECTORY_PAGE_SIZE = 20;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/** The phone directory: the search (names and number) and the pages, on the API. */
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

  return { setSearch, page, setPage, list };
}
