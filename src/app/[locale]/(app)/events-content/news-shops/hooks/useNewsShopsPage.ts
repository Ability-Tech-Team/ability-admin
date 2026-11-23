"use client";

import { useCallback, useState } from "react";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { fetchNews, type NewsFilter } from "@/src/services/newsShops";

export const NEWS_PAGE_SIZE = 20;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/** The news list: search and paging on the API. */
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

  return { setSearch, page, setPage, list };
}
