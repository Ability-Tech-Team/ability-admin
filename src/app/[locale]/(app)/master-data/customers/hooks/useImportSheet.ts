"use client";

import { useCallback, useState } from "react";
import { useApiDownload } from "@/src/hooks/useApiDownload";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { fetchImportJob, importErrorsRequest, importSheet } from "@/src/services/customers";
import type { ImportJob, ImportKind, QueuedImport } from "../types";

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  kind: ImportKind;
};

/**
 * A spreadsheet import (customers or relatives): the upload to one project, then its status on
 * request. The import worker runs it in the background, so the status is read when asked.
 */
export function useImportSheet({ apiBaseUrl, portalBaseUrl, kind }: Options) {
  const upload = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const status = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const errorReport = useApiDownload({ apiBaseUrl, portalBaseUrl });
  const [queued, setQueued] = useState<{ job: QueuedImport; projectId: number } | null>(null);
  const [job, setJob] = useState<ImportJob | null>(null);
  const { run: runUpload } = upload;
  const { run: runStatus } = status;

  const send = useCallback(
    async (projectId: number, file: File) => {
      const answer = await runUpload(({ apiBaseUrl, locale }) => importSheet(apiBaseUrl, kind, projectId, file, locale));
      if (answer) {
        setQueued({ job: answer, projectId });
        setJob(null);
      }
    },
    [runUpload, kind],
  );

  const check = useCallback(async () => {
    if (!queued) return;
    const answer = await runStatus(({ apiBaseUrl, locale }) =>
      fetchImportJob(apiBaseUrl, queued.job.importId, queued.projectId, locale),
    );
    if (answer) setJob(answer);
  }, [runStatus, queued]);

  return {
    send,
    uploading: upload.pending,
    uploadFailure: upload.failure,
    queued: queued?.job ?? null,
    check,
    checking: status.pending,
    statusFailure: status.failure,
    job,
    /** Downloads the rows the import refused, once the import says there are some. */
    downloadErrors:
      queued && job?.hasErrorReport
        ? () => errorReport.download(importErrorsRequest(queued.job.importId, queued.projectId))
        : null,
    downloadingErrors: errorReport.pending,
    errorsFailure: errorReport.failure,
  };
}
