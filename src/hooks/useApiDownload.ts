"use client";

import { useCallback } from "react";
import { apiDownload, type DownloadRequest, type DownloadedFile } from "@/src/lib/apiClient";
import { useApiMutation } from "./useApiMutation";

/** Hands a downloaded file to the browser as a save. */
export function saveFile({ blob, fileName }: DownloadedFile): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before letting the URL go.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

/**
 * Exports and reports for a screen: `download(request)` fetches the file with the page's
 * language and saves it. One at a time (a second click while one runs is ignored); `failure`
 * says why the last one failed, for `ApiFailureNotice`.
 */
export function useApiDownload({ apiBaseUrl, portalBaseUrl }: Options) {
  const { run, pending, failure, reset } = useApiMutation({ apiBaseUrl, portalBaseUrl });

  const download = useCallback(
    async (request: DownloadRequest) => {
      const file = await run(({ apiBaseUrl: base, locale }) => apiDownload(base, request, { locale }));
      if (file) saveFile(file);
      return Boolean(file);
    },
    [run],
  );

  return { download, pending, failure, reset };
}
