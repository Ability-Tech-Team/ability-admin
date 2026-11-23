"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import DetailPanel from "@/src/components/DetailPanel";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import {
  COMPLAINT_RESPONSE_MAX_LENGTH,
  nextComplaintStatusIds,
  type Complaint,
} from "@/src/services/complaints";
import { complaintStatusKeys, complaintStatusStyle, optionalId } from "../utils";

type Props = {
  complaint: Complaint;
  /** True while the list reloads after a save. */
  refreshing: boolean;
  saving: boolean;
  saveFailure: ApiFailure | null;
  /** Resolves true when saved. */
  onAddResponse: (response: string) => Promise<boolean>;
  /** Resolves true when saved. */
  onChangeStatus: (statusId: number) => Promise<boolean>;
  onClose: () => void;
};

export default function ComplaintDetail({
  complaint,
  refreshing,
  saving,
  saveFailure,
  onAddResponse,
  onChangeStatus,
  onClose,
}: Props) {
  const t = useTranslations("Operations");
  const tc = useTranslations("ComplaintsScreen");
  const [response, setResponse] = useState("");
  const [nextStatusId, setNextStatusId] = useState<number | null>(null);

  const nextStatuses = nextComplaintStatusIds(complaint.statusId);
  const busy = saving || refreshing;

  async function submitResponse() {
    if (!response.trim()) return;
    if (await onAddResponse(response)) setResponse("");
  }

  async function submitStatus() {
    if (nextStatusId === null) return;
    if (await onChangeStatus(nextStatusId)) setNextStatusId(null);
  }

  return (
    <DetailPanel title={`#${complaint.id}`} onClose={onClose} width="w-[480px] max-w-full" closeLabel={tc("close")}>
      <div className="flex flex-col gap-5 p-5" aria-busy={refreshing}>
        {/* Title + description + badges */}
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">{complaint.title ?? complaint.typeName ?? "—"}</h3>
          <p className="whitespace-pre-wrap text-[12px] text-gray-500 mt-1">{complaint.details}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {complaint.typeName && (
              <span className="rounded-full border border-gray-300 px-3 py-0.5 text-[11px] font-medium text-gray-500">
                {complaint.typeName}
              </span>
            )}
            <span className={`rounded-full border px-3 py-0.5 text-[11px] font-medium ${complaintStatusStyle(complaint.statusId)}`}>
              {complaint.statusName ?? "—"}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard label={t("detail.unit")} value={complaint.unitNumber} />
          <InfoCard label={t("complaintDetail.submittedBy")} value={complaint.customerName} />
          <InfoCard label={tc("mobile")} value={complaint.mobileNumber ?? "—"} />
          <InfoCard label={tc("department")} value={complaint.departmentName ?? "—"} />
          <InfoCard label={t("detail.created")} value={complaint.createdAt} />
          <InfoCard label={tc("source")} value={complaint.sourceName ?? "—"} />
          <InfoCard label={tc("recordedBy")} value={complaint.createdBy ?? "—"} />
        </div>

        {/* Timeline: the complaint's log, newest first */}
        <div>
          <h4 className="text-[12px] font-semibold text-gray-900 mb-3">{t("complaintDetail.ticketTimeline")}</h4>
          {complaint.logs.length === 0 && <p className="text-[11px] text-gray-400">{tc("noActivity")}</p>}
          <div className="flex flex-col">
            {complaint.logs.map((entry, i) => (
              <div key={entry.id} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-blue-500 bg-white" />
                  {i < complaint.logs.length - 1 && (
                    <span className="w-px flex-1 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-900">{entry.description ?? entry.actionName ?? "—"}</p>
                  {entry.actor && <p className="text-[10px] text-gray-400 mt-0.5">{entry.actor}</p>}
                  <p className="text-[10px] text-gray-400">{entry.at}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responses to the customer */}
        <div>
          <h4 className="text-[12px] font-semibold text-gray-900 mb-1">{tc("responses")}</h4>
          <p className="text-[10.5px] text-gray-400 mb-2">{tc("responsesHint")}</p>
          {complaint.responses.length === 0 ? (
            <p className="text-[11px] text-gray-400 mb-3">{tc("noResponses")}</p>
          ) : (
            <ul className="mb-3 flex flex-col gap-2">
              {complaint.responses.map((entry) => (
                <li key={entry.id} className="rounded-lg bg-gray-50 px-3 py-2">
                  <p className="whitespace-pre-wrap text-[11px] text-gray-900">{entry.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {[entry.author, entry.statusName, entry.at].filter(Boolean).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder={tc("writeResponse")}
            aria-label={tc("writeResponse")}
            maxLength={COMPLAINT_RESPONSE_MAX_LENGTH}
            disabled={busy}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none disabled:opacity-60"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={submitResponse}
              disabled={busy || !response.trim()}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {tc("addResponse")}
            </button>
          </div>
        </div>

        {saveFailure && <ApiFailureNotice failure={saveFailure} />}

        {/* Status change: forward only; resolving needs a response first */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
          <label htmlFor="complaint-status" className="text-[12px] font-medium text-gray-900">
            {t("columns.status")}
          </label>
          {nextStatuses.length === 0 ? (
            <span className="text-[11px] text-gray-400">{tc("statusFinal")}</span>
          ) : (
            <div className="flex items-center gap-2">
              <select
                id="complaint-status"
                value={nextStatusId ?? ""}
                onChange={(e) => setNextStatusId(optionalId(e.target.value))}
                disabled={busy}
                className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-900 outline-none hover:bg-gray-50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              >
                <option value="">{tc("chooseStatus")}</option>
                {nextStatuses.map((statusId) => (
                  <option key={statusId} value={statusId}>
                    {tc(`statuses.${complaintStatusKeys[statusId]}`)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={submitStatus}
                disabled={busy || nextStatusId === null}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {tc("updateStatus")}
              </button>
            </div>
          )}
        </div>
      </div>
    </DetailPanel>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
      <p className="text-[10.5px] font-semibold text-gray-500 mb-0.5">{label}</p>
      <p className="break-words text-[12px] font-medium text-gray-700">{value}</p>
    </div>
  );
}
