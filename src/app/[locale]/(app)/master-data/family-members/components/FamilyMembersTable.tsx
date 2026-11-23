"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { FamilyMemberRequest } from "../types";

type FamilyMembersTableProps = {
  requests: FamilyMemberRequest[];
  /** True before the first page arrives. */
  loading: boolean;
  /** Project names by id, when the projects could be listed. */
  projectNames: ReadonlyMap<number, string>;
  /** An answer is being saved: the buttons wait. */
  busy: boolean;
  pendingId: number | null;
  onAccept: (request: FamilyMemberRequest) => void;
  onReject: (request: FamilyMemberRequest) => void;
  onRevert: (request: FamilyMemberRequest) => void;
  /** The pager, under the rows. */
  footer: React.ReactNode;
};

const idBadgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";
const headClass = "px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]";
const none = "—";

const statusClass: Record<string, string> = {
  pending: "border border-yellow-300 bg-yellow-50 text-yellow-600",
  approved: "border border-green-300 bg-green-50 text-green-600",
  rejected: "border border-red-300 bg-red-50 text-red-600",
};

export default function FamilyMembersTable({
  requests,
  loading,
  projectNames,
  busy,
  pendingId,
  onAccept,
  onReject,
  onRevert,
  footer,
}: FamilyMembersTableProps) {
  const t = useTranslations("MasterData");
  const tf = useTranslations("FamilyMembersScreen");
  const [preview, setPreview] = useState<FamilyMemberRequest | null>(null);

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full min-w-[960px] table-fixed">
        <colgroup>
          <col style={{ width: "8%" }} />
          <col style={{ width: "7.5%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "8.5%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className={`${headClass} px-3`}>{t("familyColumns.familyMember")}</th>
            <th className={headClass}>{t("familyColumns.ownerName")}</th>
            <th className={headClass}>{t("familyColumns.idPassportType")}</th>
            <th className={headClass}>{t("familyColumns.idPassport")}</th>
            <th className={headClass}>{t("familyColumns.assignedUnit")}</th>
            <th className={headClass}>{t("familyColumns.relationship")}</th>
            <th className={headClass}>{t("familyColumns.mobile")}</th>
            <th className={headClass}>{t("familyColumns.email")}</th>
            <th className={headClass}>{t("familyColumns.requestStatus")}</th>
            <th className={headClass}>{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 && (
            <tr>
              <td colSpan={10} className="px-3 py-10 text-center text-[11px] text-gray-400" aria-live="polite">
                {loading ? tf("loading") : tf("empty")}
              </td>
            </tr>
          )}
          {requests.map((request) => {
            const project = projectNames.get(request.projectId);
            const waiting = busy && pendingId === request.id;
            return (
              <tr key={request.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                {/* Family Member */}
                <td className="px-3 py-4 text-[11px] text-gray-900">{request.name || none}</td>

                {/* Owner Name */}
                <td className="px-2 py-4 text-[11px] text-gray-900">{request.ownerName ?? none}</td>

                {/* ID / Passport Type */}
                <td className="px-2 py-4">
                  {request.idType ? (
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase ${idBadgeClass}`}>
                      {t(`idTypes.${request.idType}`)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400">{none}</span>
                  )}
                </td>

                {/* ID / Passport */}
                <td className="px-2 py-4 text-[11px] text-gray-900 break-all">{request.idNumber}</td>

                {/* Assigned Unit */}
                <td className="px-2 py-4 text-[11px] text-gray-900">
                  {request.unitNumber ? (project ? `${project} - ${request.unitNumber}` : request.unitNumber) : none}
                </td>

                {/* Relationship */}
                <td className="px-2 py-4 text-[11px] text-gray-900">{request.relationship ?? none}</td>

                {/* Mobile */}
                <td className="px-2 py-4 text-[11px] text-gray-900">{request.mobile ?? none}</td>

                {/* Email */}
                <td className="px-2 py-4 text-[11px] text-gray-900 break-all">{request.email ?? none}</td>

                {/* Request Status */}
                <td className="px-2 py-4">
                  <span
                    title={request.rejectReason ?? undefined}
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${request.status ? statusClass[request.status] : "border border-gray-200 text-gray-500"}`}
                  >
                    {request.status ? t(`familyColumns.statuses.${request.status}`) : (request.statusName ?? none)}
                  </span>
                  {request.rejectReason && (
                    <p className="mt-1 text-[9px] text-gray-400">{tf("rejectReasonShown", { reason: request.rejectReason })}</p>
                  )}
                </td>

                {/* Actions */}
                <td className="px-2 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPreview(request)}
                      disabled={request.attachments.length === 0}
                      className="rounded-md px-2.5 py-1 text-[11px] font-medium text-gray-700 active:bg-gray-100 active:shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                    >
                      {t("assignmentDetail.attachments")}
                    </button>
                    {request.status === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onAccept(request)}
                          className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                        >
                          {waiting ? tf("saving") : t("familyColumns.approve")}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onReject(request)}
                          className="rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                        >
                          {t("familyColumns.reject")}
                        </button>
                      </>
                    )}
                    {request.status === "approved" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onRevert(request)}
                        className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      >
                        {waiting ? tf("saving") : tf("revert")}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3">{footer}</div>

      {/* Attachments */}
      {preview && (
        <>
          <div className="fixed inset-0 z-60 bg-black/30 backdrop-blur-xs" onClick={() => setPreview(null)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="family-attachments-title"
            className="fixed z-70 top-1/2 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2 w-[340px] max-w-[calc(100vw-32px)] rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="family-attachments-title" className="text-[13px] font-semibold text-gray-900">{t("assignmentDetail.attachmentPreview")}</h3>
              <button type="button" onClick={() => setPreview(null)} aria-label={tf("close")} className="text-gray-400 hover:text-gray-600">
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {preview.attachments.map((attachment, index) => (
                <div key={attachment.url} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3">
                  <p className="text-[12px] font-semibold text-gray-900">
                    {tf(`attachments.${attachment.kind}`, { number: index + 1 })}
                  </p>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-md border border-gray-200 bg-white px-3 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {t("open")}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
