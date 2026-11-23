"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiDownload } from "@/src/hooks/useApiDownload";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { useApiQuery } from "@/src/hooks/useApiQuery";
import {
  fetchImportJob,
  importErrorReportRequest,
  importUnits,
  isImportRunning,
  unitImportFileProblem,
  type QueuedImport,
} from "@/src/services/units";

/** How often a running import's progress is read again. */
const POLL_MS = 4000;

type Options = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
};

export type ImportFormProblem = "project" | "file" | "type" | "size";

/**
 * The units import: queue a sheet for a project (`POST /imports/units`), then follow the
 * job (`GET /imports/:id`) until it ends.
 */
export function useUnitImport({ apiBaseUrl, portalBaseUrl }: Options) {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [problem, setProblem] = useState<ImportFormProblem | null>(null);
  const [queued, setQueued] = useState<(QueuedImport & { projectId: number }) | null>(null);
  const upload = useApiMutation({ apiBaseUrl, portalBaseUrl });
  const errorReport = useApiDownload({ apiBaseUrl, portalBaseUrl });

  const job = useApiQuery({
    apiBaseUrl,
    portalBaseUrl,
    key: `import-${queued?.importId ?? ""}`,
    enabled: queued !== null,
    load: ({ apiBaseUrl: base, locale }) =>
      queued
        ? fetchImportJob(base, queued.importId, queued.projectId, locale)
        : Promise.reject(new Error("No import is queued")),
  });

  // The query keeps its last answer while a new key loads: only this import's counts.
  const current = job.data && queued && job.data.id === queued.importId ? job.data : null;
  const status = current?.status ?? queued?.status ?? null;
  const running = status !== null && isImportRunning(status);
  const { reload } = job;

  // Read it again while it runs; after a failure the notice's "Check again" takes over.
  const polling = running && !job.loading && !job.failure;
  useEffect(() => {
    if (!polling) return;
    const timer = setTimeout(reload, POLL_MS);
    return () => clearTimeout(timer);
  }, [polling, reload]);

  const submit = useCallback(async () => {
    if (projectId === null) return setProblem("project");
    if (!file) return setProblem("file");
    const fileProblem = unitImportFileProblem(file);
    if (fileProblem) return setProblem(fileProblem);
    setProblem(null);
    const answer = await upload.run(({ apiBaseUrl: base, locale }) => importUnits(base, projectId, file, locale));
    if (answer) setQueued({ ...answer, projectId });
  }, [projectId, file, upload]);

  const reset = useCallback(() => {
    setFile(null);
    setProblem(null);
    setQueued(null);
    upload.reset();
  }, [upload]);

  return {
    projectId,
    setProjectId,
    file,
    setFile,
    problem,
    submit,
    uploading: upload.pending,
    uploadFailure: upload.failure,
    queued,
    current,
    jobFailure: job.failure,
    refresh: reload,
    status,
    running,
    reset,
    /** Downloads the rows the import refused (only once it reports some). */
    downloadErrors: () =>
      queued ? errorReport.download(importErrorReportRequest(queued.importId, queued.projectId)) : undefined,
    downloadingErrors: errorReport.pending,
    errorsFailure: errorReport.failure,
  };
}
