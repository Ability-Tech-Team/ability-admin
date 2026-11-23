"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import { useCustomerDetail } from "../hooks/useCustomersPage";
import type { Customer } from "../types";

type Props = {
  customer: Customer;
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  /** Resolves with whether the customer itself was deleted, or undefined when refused. */
  onConfirm: (projectId: number) => Promise<boolean | undefined>;
  pending: boolean;
  failure: ApiFailure | null;
  /** `deleted`: the customer is gone, so whatever showed them closes too. */
  onClose: (deleted: boolean) => void;
};

/**
 * Confirms removing the customer from one of their projects (the API deletes per project and
 * deletes the customer once none is left), choosing the project when there are several.
 */
export default function DeleteCustomerDialog({ customer, apiBaseUrl, portalBaseUrl, onConfirm, pending, failure, onClose }: Props) {
  const tc = useTranslations("CustomersScreen");
  const t = useTranslations("MasterData");
  const detail = useCustomerDetail({ apiBaseUrl, portalBaseUrl }, customer.id);
  const projects = detail.data?.projects ?? [];
  const [chosen, setChosen] = useState("");
  const [keptElsewhere, setKeptElsewhere] = useState<string | null>(null);

  const projectId = projects.length === 1 ? String(projects[0].id) : chosen;
  const projectName = (id: string) => {
    const project = projects.find((item) => String(item.id) === id);
    return project?.name ?? (id ? `#${id}` : "");
  };

  async function confirm() {
    if (!projectId) return;
    const deleted = await onConfirm(Number(projectId));
    if (deleted === undefined) return;
    if (deleted) onClose(true);
    else setKeptElsewhere(projectName(projectId));
  }

  return (
    <>
      <div className="fixed inset-0 z-80 bg-black/30 backdrop-blur-xs" onClick={() => onClose(false)} />
      <div className="fixed inset-0 z-90 flex items-center justify-center p-4" onClick={() => onClose(false)}>
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-customer-title"
          aria-describedby="delete-customer-body"
          className="w-full max-w-[400px] rounded-xl bg-white p-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="delete-customer-title" className="text-[13px] font-semibold text-gray-900">{tc("delete.title")}</h2>

          <div id="delete-customer-body" className="mt-3 flex flex-col gap-3 text-[11px] text-gray-600">
            {keptElsewhere !== null ? (
              <p role="status">{tc("delete.removedFromProject", { name: customer.name, project: keptElsewhere })}</p>
            ) : detail.failure ? (
              <ApiFailureNotice failure={detail.failure} onRetry={detail.reload} />
            ) : !detail.data ? (
              <p aria-live="polite">{tc("delete.loading")}</p>
            ) : (
              <>
                {projects.length > 1 ? (
                  <div>
                    <label htmlFor="delete-customer-project" className="mb-1 block text-[10px] font-medium text-gray-500">
                      {tc("delete.chooseProject")}
                    </label>
                    <select
                      id="delete-customer-project"
                      value={chosen}
                      onChange={(e) => setChosen(e.target.value)}
                      disabled={pending}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] text-gray-900 outline-none focus:border-blue-400"
                    >
                      <option value="">{tc("chooseProject")}</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.name ?? `#${project.id}`}</option>
                      ))}
                    </select>
                  </div>
                ) : null}
                {projectId && <p>{tc("delete.body", { name: customer.name, project: projectName(projectId) })}</p>}
                {projects.length === 0 && <p>{tc("delete.noProject")}</p>}
                <p className="font-medium text-red-600">{tc("delete.irreversible")}</p>
              </>
            )}
            {failure && keptElsewhere === null && <ApiFailureNotice failure={failure} />}
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            {keptElsewhere !== null ? (
              <button
                type="button"
                onClick={() => onClose(true)}
                className="rounded-full bg-blue-600 px-5 py-2 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors"
              >
                {tc("close")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onClose(false)}
                  className="rounded-full border border-gray-200 bg-white px-5 py-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => void confirm()}
                  disabled={!projectId || pending}
                  className="rounded-full bg-red-600 px-5 py-2 text-[11px] font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  {pending ? tc("delete.deleting") : tc("delete.confirm")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
