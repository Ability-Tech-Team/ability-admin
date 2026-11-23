"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { toApiFailure, type ApiFailure } from "@/src/lib/apiFailure";
import type { ApiQueryContext } from "./useApiQuery";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * Saves (create, update, delete, accept...) for a screen. `run` ignores a second call while
 * one is in flight, so a double click can't send twice. It resolves with the answer, or with
 * `undefined` after a failure, which `failure` then describes until the next `run` or `reset`.
 */
export function useApiMutation({ apiBaseUrl, portalBaseUrl }: Options) {
  const locale = useLocale();
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<ApiFailure | null>(null);

  const run = useCallback(
    async <T>(save: (context: ApiQueryContext) => Promise<T>): Promise<T | undefined> => {
      if (inFlight.current) return undefined;
      if (!apiBaseUrl) {
        setFailure({ reason: "noApi" });
        return undefined;
      }
      inFlight.current = true;
      setPending(true);
      setFailure(null);
      try {
        return await save({ apiBaseUrl, locale });
      } catch (error) {
        setFailure(toApiFailure(error, portalBaseUrl, locale));
        return undefined;
      } finally {
        inFlight.current = false;
        setPending(false);
      }
    },
    [apiBaseUrl, portalBaseUrl, locale],
  );

  const reset = useCallback(() => setFailure(null), []);

  return { run, pending, failure, reset };
}
