"use client";

import { useCallback, useState } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";

/** What is about to be deleted; `name` is shown in the confirmation. */
export type DeleteTarget = { id: number; name: string };

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** The content's delete service (`DELETE /content/...`). */
  remove: (apiBaseUrl: string, id: number, locale: string) => Promise<void>;
  /** After the API has deleted it: close its form and reload the list. */
  onDeleted: () => void;
};

/** Deleting a news article, event, guideline or phone contact: the confirmation, then the API call. */
export function useContentDelete({ apiBaseUrl, portalBaseUrl, remove, onDeleted }: Options) {
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  const { run, reset, pending, failure } = useApiMutation({ apiBaseUrl, portalBaseUrl });

  const ask = useCallback(
    (next: DeleteTarget) => {
      reset();
      setTarget(next);
    },
    [reset],
  );

  /** Ignored while the API is deleting. */
  const cancel = useCallback(() => {
    if (!pending) setTarget(null);
  }, [pending]);

  /** Resolves true once deleted; the confirmation stays open with `failure` otherwise. */
  const confirm = useCallback(async () => {
    if (!target) return false;
    const done = await run(async ({ apiBaseUrl: base, locale }) => {
      await remove(base, target.id, locale);
      return true;
    });
    if (!done) return false;
    setTarget(null);
    onDeleted();
    return true;
  }, [target, run, remove, onDeleted]);

  return { target, ask, cancel, confirm, pending, failure };
}

export type ContentDelete = ReturnType<typeof useContentDelete>;

/**
 * The page to show after deleting one of the `shown` items on `page`: the one before when that
 * was the last item of a later page, which would otherwise come back empty.
 */
export function pageAfterDelete(page: number, shown: number): number {
  return page > 1 && shown <= 1 ? page - 1 : page;
}
