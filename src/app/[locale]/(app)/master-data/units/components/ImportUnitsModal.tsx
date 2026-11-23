"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import {
  UNIT_IMPORT_COLUMNS,
  UNIT_IMPORT_EXTENSIONS,
} from "@/src/services/units";
import type { useUnitImport } from "../hooks/useUnitImport";
import type { ProjectOption } from "@/src/services/projects";

type Props = {
  apiBaseUrl: string | null;
  projects: ProjectOption[] | null;
  projectsUnavailable: boolean;
  flow: ReturnType<typeof useUnitImport>;
  onClose: () => void;
};

const input =
  "h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors";

export default function ImportUnitsModal({ apiBaseUrl, projects, projectsUnavailable, flow, onClose }: Props) {
  const t = useTranslations("MasterData");
  const tUnits = useTranslations("UnitsScreen");
  const { queued, current, status } = flow;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-units-title"
          className="w-[520px] max-w-full max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 id="import-units-title" className="text-[15px] font-bold text-gray-900">
              {tUnits("import.title")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={tUnits("import.close")}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {!queued ? (
            <form
              className="flex flex-col gap-4 px-6"
              onSubmit={(event) => {
                event.preventDefault();
                void flow.submit();
              }}
            >
              <div>
                <label htmlFor="import-project" className="mb-1 block text-[11px] font-medium text-gray-700">
                  {t("addUnitModal.project")} <span className="text-red-500">*</span>
                </label>
                <select
                  id="import-project"
                  value={flow.projectId ?? ""}
                  disabled={projectsUnavailable}
                  onChange={(event) => flow.setProjectId(event.target.value ? Number(event.target.value) : null)}
                  className={`${input} bg-white`}
                >
                  <option value="">{tUnits("import.chooseProject")}</option>
                  {(projects ?? []).map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {projectsUnavailable && (
                  <p className="mt-1 text-[11px] text-amber-700">{tUnits("projectsUnavailable")}</p>
                )}
              </div>

              <div>
                <label htmlFor="import-file" className="mb-1 block text-[11px] font-medium text-gray-700">
                  {tUnits("import.file")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="import-file"
                  type="file"
                  accept={UNIT_IMPORT_EXTENSIONS.join(",")}
                  onChange={(event) => flow.setFile(event.target.files?.[0] ?? null)}
                  className="w-full text-[12px] text-gray-700 file:me-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-gray-600 hover:file:bg-gray-50"
                />
                <p className="mt-1 text-[11px] text-gray-400">{tUnits("import.fileHint")}</p>
                <p className="mt-1 text-[11px] text-gray-400">
                  {tUnits("import.columns", {
                    required: UNIT_IMPORT_COLUMNS.required.join(", "),
                    optional: UNIT_IMPORT_COLUMNS.optional.join(", "),
                  })}
                </p>
              </div>

              {flow.problem && (
                <p role="alert" className="text-[12px] text-red-600">
                  {tUnits(`import.problems.${flow.problem}`)}
                </p>
              )}
              {flow.uploadFailure && <ApiFailureNotice failure={flow.uploadFailure} />}

              <div className="flex items-center justify-end gap-3 pt-1 pb-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={flow.uploading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {flow.uploading ? tUnits("import.uploading") : tUnits("import.submit")}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3 px-6 pb-5" aria-live="polite">
              <p className="text-[12px] text-gray-700">
                <span className="font-semibold">{queued.fileName}</span>
                {status && <> · {tUnits(`import.statuses.${status}`)}</>}
              </p>
              <p className="text-[11px] text-gray-400">
                {tUnits("import.columns", {
                  required: queued.expectedColumns.required.join(", "),
                  optional: queued.expectedColumns.optional.join(", "),
                })}
              </p>
              {current && current.totalRows !== null && (
                <p className="text-[12px] text-gray-700">
                  {tUnits("import.summary", {
                    total: current.totalRows,
                    inserted: current.insertedRows ?? 0,
                    skipped: current.skippedRows ?? 0,
                    failed: current.failedRows ?? 0,
                  })}
                </p>
              )}
              {current?.errorMessage && <p className="text-[12px] text-red-600">{current.errorMessage}</p>}
              {flow.jobFailure && <ApiFailureNotice failure={flow.jobFailure} onRetry={flow.refresh} />}
              {flow.errorsFailure && <ApiFailureNotice failure={flow.errorsFailure} />}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                {current?.hasErrorReport && apiBaseUrl && (
                  <button
                    type="button"
                    onClick={() => void flow.downloadErrors()}
                    disabled={flow.downloadingErrors}
                    className="rounded-lg border border-blue-600 px-4 py-2 text-[12px] font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                  >
                    {tUnits("import.errorReport")}
                  </button>
                )}
                {flow.running && (
                  <button
                    type="button"
                    onClick={flow.refresh}
                    className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {tUnits("import.refresh")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={flow.reset}
                  disabled={flow.running}
                  className="rounded-lg px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {tUnits("import.another")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  {tUnits("import.close")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
