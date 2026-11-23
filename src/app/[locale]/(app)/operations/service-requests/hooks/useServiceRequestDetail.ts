"use client";

import { useCallback } from "react";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import {
  addServiceRequestComment,
  changeServiceRequestStatus,
  fetchServiceRequest,
} from "@/src/services/serviceRequests";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  id: number;
  /** Called after a save, so the list and its counts catch up. */
  onChanged: () => void;
};

/** One service request, with its comments and status change. Each save reloads it. */
export function useServiceRequestDetail({ apiBaseUrl, portalBaseUrl, id, onChanged }: Options) {
  const detail = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `detail|${id}`,
    load: ({ apiBaseUrl, locale }) => fetchServiceRequest(apiBaseUrl, id, locale),
  });
  const mutation = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const { run } = mutation;
  const { reload } = detail;

  /** Resolves true when the comment was saved. */
  const addComment = useCallback(
    async (comment: string) => {
      const saved = await run(async ({ apiBaseUrl, locale }) => {
        await addServiceRequestComment(apiBaseUrl, id, comment, locale);
        return true;
      });
      if (saved) reload();
      return Boolean(saved);
    },
    [run, reload, id],
  );

  /** Resolves true when the status was changed. */
  const changeStatus = useCallback(
    async (statusId: number, rejectReason: string) => {
      const saved = await run(async ({ apiBaseUrl, locale }) => {
        await changeServiceRequestStatus(apiBaseUrl, id, statusId, rejectReason, locale);
        return true;
      });
      if (saved) {
        reload();
        onChanged();
      }
      return Boolean(saved);
    },
    [run, reload, onChanged, id],
  );

  return {
    request: detail.data,
    loading: detail.loading,
    failure: detail.failure,
    reload,
    addComment,
    changeStatus,
    saving: mutation.pending,
    saveFailure: mutation.failure,
    resetSaveFailure: mutation.reset,
  };
}
