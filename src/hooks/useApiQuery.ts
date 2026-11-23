"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { toApiFailure, type ApiFailure } from "@/src/lib/apiFailure";

export type ApiQueryContext = {
  /** Where the browser calls the API. */
  apiBaseUrl: string;
  /** The page's locale, for the API's `lang`. */
  locale: string;
};

type Options<T> = {
  /** Where the browser calls the API (`browserApiBaseUrl`), or null when the sign-in names none this app trusts. */
  apiBaseUrl: string | null;
  /** Ability Portal, for signing in again when the session has ended. */
  portalBaseUrl: string | null;
  /**
   * Everything the request depends on (filters, page, search...), as a stable string. A new
   * key loads again; an older, slower answer never replaces a newer one.
   */
  key: string;
  /** Loads the data. Read the current filters from the closure: they are captured with `key`. */
  load: (context: ApiQueryContext) => Promise<T>;
  /** False skips loading (e.g. a detail with nothing selected, or invalid filters). */
  enabled?: boolean;
};

type Loaded<T> = { key: string; data: T | null; failure: ApiFailure | null };

/**
 * One API read for a screen: loading, the data, and why it failed. While a new key loads,
 * `data` keeps the previous answer so the screen doesn't flash empty; `loading` says it is
 * stale. `reload()` loads the same key again (after a save, or the notice's "Try again").
 */
export function useApiQuery<T>({ apiBaseUrl, portalBaseUrl, key, load, enabled = true }: Options<T>) {
  const locale = useLocale();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded<T> | null>(null);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  const fullKey = `${locale}|${attempt}|${key}`;

  useEffect(() => {
    if (!apiBaseUrl || !enabled) return;
    let current = true;
    loadRef.current({ apiBaseUrl, locale }).then(
      (data) => {
        if (current) setLoaded({ key: fullKey, data, failure: null });
      },
      (error: unknown) => {
        if (current) {
          setLoaded((previous) => ({
            key: fullKey,
            data: previous?.data ?? null,
            failure: toApiFailure(error, portalBaseUrl, locale),
          }));
        }
      },
    );
    return () => {
      current = false;
    };
  }, [apiBaseUrl, portalBaseUrl, enabled, locale, fullKey]);

  const reload = useCallback(() => setAttempt((previous) => previous + 1), []);

  const failure: ApiFailure | null = !apiBaseUrl
    ? { reason: "noApi" }
    : enabled && loaded?.key === fullKey
      ? loaded.failure
      : null;

  return {
    data: enabled ? (loaded?.data ?? null) : null,
    loading: Boolean(apiBaseUrl) && enabled && loaded?.key !== fullKey,
    failure,
    reload,
  };
}
