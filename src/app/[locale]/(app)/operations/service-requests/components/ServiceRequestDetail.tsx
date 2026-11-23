"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import DetailPanel from "@/src/components/DetailPanel";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import { TICKET_STATUS, nextTicketStatusIds } from "@/src/services/serviceRequests";
import { useServiceRequestDetail } from "../hooks/useServiceRequestDetail";
import { optionalId, ticketStatusKeys, ticketStatusStyle } from "../utils";

type Props = {
  apiBaseUrl: string | null;
  portalBaseUrl: string | null;
  id: number;
  onChanged: () => void;
  onClose: () => void;
};

export default function ServiceRequestDetail({ apiBaseUrl, portalBaseUrl, id, onChanged, onClose }: Props) {
  const t = useTranslations("Operations");
  const ts = useTranslations("ServiceRequestsScreen");
  const detail = useServiceRequestDetail({ apiBaseUrl, portalBaseUrl, id, onChanged });
  const { request } = detail;

  const [comment, setComment] = useState("");
  const [nextStatusId, setNextStatusId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const nextStatuses = request ? nextTicketStatusIds(request.statusId) : [];
  const rejecting = nextStatusId === TICKET_STATUS.rejected;
  const canChangeStatus =
    nextStatusId !== null && nextStatuses.includes(nextStatusId) && (!rejecting || rejectReason.trim() !== "");

  async function submitComment() {
    if (!comment.trim()) return;
    if (await detail.addComment(comment)) setComment("");
  }

  async function submitStatus() {
    if (nextStatusId === null) return;
    if (await detail.changeStatus(nextStatusId, rejectReason)) {
      setNextStatusId(null);
      setRejectReason("");
    }
  }

  const style = request ? ticketStatusStyle(request.statusId) : null;
  const services = request?.services.map((service) => `${service.name ?? `#${service.id}`} × ${service.quantity}`).join(", ");

  return (
    <DetailPanel title={`#${id}`} onClose={onClose} width="w-[480px] max-w-full" closeLabel={ts("close")}>
      <div className="flex flex-col gap-5 p-5">
        {detail.failure && <ApiFailureNotice failure={detail.failure} onRetry={detail.reload} />}
        {!request && detail.loading && (
          <p className="text-[12px] text-gray-400">{ts("loadingDetail")}</p>
        )}

        {request && style && (
          <>
            {/* Title + badges */}
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">{services || "—"}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-0.5 text-[11px] font-medium ${style.border} ${style.text}`}>
                  {request.statusName ?? "—"}
                </span>
                {request.sourceName && (
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-medium text-blue-600">
                    {request.sourceName}
                  </span>
                )}
                {request.isUrgent && (
                  <span className="rounded-full border border-red-200 bg-red-50 px-3 py-0.5 text-[11px] font-medium text-red-600">
                    {ts("urgent")}
                  </span>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <InfoCard label={t("detail.unit")} value={[request.unitNumber, request.unitType].filter(Boolean).join(" · ")} />
              <InfoCard label={t("detail.customer")} value={`${request.customerName} · ${request.customerMobile}`} />
              <InfoCard label={ts("detail.requester")} value={request.requesterName} />
              <InfoCard label={t("detail.type")} value={request.departmentName ?? "—"} />
              <InfoCard label={ts("detail.createdBy")} value={request.agentName ?? "—"} />
              <InfoCard label={t("detail.created")} value={request.requestedAt} />
              <InfoCard label={t("detail.dueDateAndTime")} value={`${request.arrivalDate} ${request.arrivalTime}`.trim() || "—"} />
              <InfoCard label={ts("detail.total")} value={request.totalPrice.toLocaleString("en-US")} />
              {request.notes && (
                <div className="col-span-2">
                  <InfoCard label={ts("detail.notes")} value={request.notes} />
                </div>
              )}
              {request.rejectReason && (
                <div className="col-span-2">
                  <InfoCard label={ts("detail.rejectReason")} value={request.rejectReason} />
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div>
              <h4 className="text-[12px] font-semibold text-gray-900 mb-3">{t("detail.activityTimeline")}</h4>
              {request.logs.length === 0 && <p className="text-[11px] text-gray-400">{ts("detail.noActivity")}</p>}
              <div className="flex flex-col gap-0">
                {request.logs.map((entry, i) => (
                  <div key={entry.id} className="flex gap-3 pb-4 last:pb-0">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                      {i < request.logs.length - 1 && (
                        <span className="w-px flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-gray-900">{entry.description ?? entry.statusName ?? "—"}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {[entry.actor, entry.at].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-[12px] font-semibold text-gray-900 mb-2">{ts("detail.comments")}</h4>
              {request.comments.length === 0 ? (
                <p className="text-[11px] text-gray-400 mb-3">{ts("detail.noComments")}</p>
              ) : (
                <ul className="mb-3 flex flex-col gap-2">
                  {request.comments.map((entry) => (
                    <li key={entry.id} className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="whitespace-pre-wrap text-[11px] text-gray-900">{entry.text}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {[entry.author, entry.position, entry.at].filter(Boolean).join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <label htmlFor="service-request-comment" className="mb-2 block text-[12px] font-semibold text-gray-900">
                {t("detail.addComment")}
              </label>
              <textarea
                id="service-request-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("detail.commentPlaceholder")}
                disabled={detail.saving}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none disabled:opacity-60"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={detail.saving || !comment.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("detail.addComment")}
                </button>
              </div>
            </div>

            {detail.saveFailure && <ApiFailureNotice failure={detail.saveFailure} />}

            {/* Status change: forward only, never out of done or rejected */}
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="service-request-status" className="text-[12px] font-medium text-gray-900">
                  {t("columns.status")}
                </label>
                {nextStatuses.length === 0 ? (
                  <span className="text-[11px] text-gray-400">{ts("detail.statusFinal")}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      id="service-request-status"
                      value={nextStatusId ?? ""}
                      onChange={(e) => setNextStatusId(optionalId(e.target.value))}
                      disabled={detail.saving}
                      className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-900 outline-none hover:bg-gray-50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    >
                      <option value="">{ts("detail.chooseStatus")}</option>
                      {nextStatuses.map((statusId) => (
                        <option key={statusId} value={statusId}>
                          {ts(`statuses.${ticketStatusKeys[statusId]}`)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={submitStatus}
                      disabled={detail.saving || !canChangeStatus}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {ts("detail.updateStatus")}
                    </button>
                  </div>
                )}
              </div>
              {rejecting && (
                <div>
                  <label htmlFor="service-request-reject-reason" className="mb-1 block text-[11px] font-medium text-gray-700">
                    {ts("detail.rejectReason")}
                    <span className="text-red-500"> *</span>
                  </label>
                  <textarea
                    id="service-request-reject-reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    maxLength={255}
                    disabled={detail.saving}
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[11px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none disabled:opacity-60"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DetailPanel>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
      <p className="text-[11px] font-semibold text-gray-400 mb-0.5">{label}</p>
      <p className="break-words text-[12px] font-semibold text-gray-700">{value}</p>
    </div>
  );
}
