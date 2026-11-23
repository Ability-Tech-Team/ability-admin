"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import { useImportSheet } from "../hooks/useImportSheet";
import type { ImportKind, Named } from "../types";

type Props = {
  kind: ImportKind;
  title: string;
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  projects: { options: Named[] | null; forbidden: boolean; failure: ApiFailure | null };
  onClose: () => void;
};

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors disabled:bg-gray-50";

/** Uploads a customers or relatives spreadsheet to one project, then reads how it went. */
export default function ImportSheetModal({ kind, title, apiBaseUrl, portalBaseUrl, projects, onClose }: Props) {
  const t = useTranslations("CustomersScreen");
  const tm = useTranslations("MasterData");
  const sheet = useImportSheet({ apiBaseUrl, portalBaseUrl, kind });
  const [projectId, setProjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const canSend = Boolean(projectId && file) && !sheet.uploading;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-sheet-title"
          className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 id="import-sheet-title" className="text-[15px] font-bold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("import.close")}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <form
            className="flex flex-col gap-4 px-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSend && file) void sheet.send(Number(projectId), file);
            }}
          >
            {projects.forbidden ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                {t("projectsUnavailable")}
              </p>
            ) : (
              projects.failure && <ApiFailureNotice failure={projects.failure} />
            )}

            <div>
              <label htmlFor="import-project" className="mb-1 block text-[11px] font-medium text-gray-700">
                {tm("formFields.project")} <span className="text-red-500">*</span>
              </label>
              <select
                id="import-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={!projects.options || sheet.uploading}
                className={inputClass}
              >
                <option value="">{t("chooseProject")}</option>
                {projects.options?.map((project) => (
                  <option key={project.id} value={project.id}>{project.name ?? `#${project.id}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="import-file" className="mb-1 block text-[11px] font-medium text-gray-700">
                {t("import.file")} <span className="text-red-500">*</span>
              </label>
              <input
                id="import-file"
                type="file"
                accept=".xlsx,.xlsm,.csv"
                disabled={sheet.uploading}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-[12px] text-gray-700 file:me-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 hover:file:bg-gray-50"
              />
            </div>

            {sheet.uploadFailure && <ApiFailureNotice failure={sheet.uploadFailure} />}

            {sheet.queued && (
              <div className="flex flex-col gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-[11px] text-blue-900" aria-live="polite">
                <p className="font-semibold">{t("import.queued", { id: sheet.queued.importId, fileName: sheet.queued.fileName })}</p>
                <p>{t("import.requiredColumns", { columns: sheet.queued.requiredColumns.join(", ") })}</p>
                {sheet.queued.optionalColumns.length > 0 && (
                  <p>{t("import.optionalColumns", { columns: sheet.queued.optionalColumns.join(", ") })}</p>
                )}
                {sheet.job && (
                  <>
                    <p className="font-semibold">{t(`import.statuses.${sheet.job.status}`)}</p>
                    <p>
                      {t("import.counts", {
                        total: sheet.job.totalRows ?? 0,
                        inserted: sheet.job.insertedRows ?? 0,
                        updated: sheet.job.updatedRows ?? 0,
                        skipped: sheet.job.skippedRows ?? 0,
                        failed: sheet.job.failedRows ?? 0,
                      })}
                    </p>
                    {sheet.job.errorMessage && <p className="text-red-700">{sheet.job.errorMessage}</p>}
                  </>
                )}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => void sheet.check()}
                    disabled={sheet.checking}
                    className="rounded-md border border-blue-200 bg-white px-3 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                  >
                    {sheet.checking ? t("import.checking") : t("import.checkStatus")}
                  </button>
                  {sheet.downloadErrors && (
                    <button
                      type="button"
                      onClick={() => void sheet.downloadErrors?.()}
                      disabled={sheet.downloadingErrors}
                      className="text-[11px] font-medium text-blue-700 underline disabled:opacity-50"
                    >
                      {t("import.downloadErrors")}
                    </button>
                  )}
                </div>
                {sheet.statusFailure && <ApiFailureNotice failure={sheet.statusFailure} />}
                {sheet.errorsFailure && <ApiFailureNotice failure={sheet.errorsFailure} />}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-1 pb-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t("import.close")}
              </button>
              <button
                type="submit"
                disabled={!canSend}
                className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {sheet.uploading ? t("import.uploading") : t("import.submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
