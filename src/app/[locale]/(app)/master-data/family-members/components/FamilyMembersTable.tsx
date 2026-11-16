"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { FamilyMemberRecord } from "@/src/services/familyMembers";

type FamilyMembersTableProps = {
  data: FamilyMemberRecord[];
};

const idBadgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";

const statusClass: Record<string, string> = {
  pending: "border border-yellow-300 bg-yellow-50 text-yellow-600",
  approved: "border border-green-300 bg-green-50 text-green-600",
  rejected: "border border-red-300 bg-red-50 text-red-600",
};

export default function FamilyMembersTable({ data }: FamilyMembersTableProps) {
  const t = useTranslations("MasterData");
  const [members, setMembers] = useState(data);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  function updateStatus(id: string, status: "approved" | "rejected") {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, requestStatus: status } : m))
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <table className="w-full table-fixed">
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
            <th className="px-3 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("familyColumns.familyMember")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("familyColumns.ownerName")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("familyColumns.idPassportType")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("familyColumns.idPassport")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("familyColumns.assignedUnit")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("familyColumns.relationship")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("familyColumns.mobile")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("familyColumns.email")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("familyColumns.requestStatus")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              {/* Family Member */}
              <td className="px-3 py-4 text-[11px] text-gray-900">{member.name}</td>

              {/* Owner Name */}
              <td className="px-2 py-4 text-[11px] text-gray-900">{member.ownerName}</td>

              {/* ID / Passport Type */}
              <td className="px-2 py-4">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase ${idBadgeClass}`}>
                  {t(`idTypes.${member.idType}` as Parameters<typeof t>[0])}
                </span>
              </td>

              {/* ID / Passport */}
              <td className="px-2 py-4 text-[11px] text-gray-900">{member.idNumber}</td>

              {/* Assigned Unit */}
              <td className="px-2 py-4 text-[11px] text-gray-900">{member.project} - {member.assignedUnit}</td>

              {/* Relationship */}
              <td className="px-2 py-4 text-[11px] text-gray-900">{member.relationship}</td>

              {/* Mobile */}
              <td className="px-2 py-4 text-[11px] text-gray-900">{member.mobile}</td>

              {/* Email */}
              <td className="px-2 py-4 text-[11px] text-gray-900">{member.email}</td>

              {/* Request Status */}
              <td className="px-2 py-4">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusClass[member.requestStatus]}`}>
                  {t(`familyColumns.statuses.${member.requestStatus}` as Parameters<typeof t>[0])}
                </span>
              </td>

              {/* Actions */}
              <td className="px-2 py-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPreviewFile(member.attachments[0] ?? null)}
                    className="rounded-md px-2.5 py-1 text-[11px] font-medium text-gray-700 active:bg-gray-100 active:shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    {t("assignmentDetail.attachments")}
                  </button>
                  {member.requestStatus === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateStatus(member.id, "approved")}
                        className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        {t("familyColumns.approve")}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(member.id, "rejected")}
                        className="rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-600 transition-colors"
                      >
                        {t("familyColumns.reject")}
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-3">
        <span className="text-[10px] text-gray-400">
          {t("showing", { from: 1, to: members.length, total: members.length })}
        </span>
        <div className="flex items-center gap-1">
          <button type="button" className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100">
            <ChevronLeftIcon className="h-2.5 w-2.5" />
          </button>
          <button type="button" className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-[10px] font-medium text-white">
            1
          </button>
          <button type="button" className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100">
            <ChevronRightIcon className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {/* Attachment Preview Modal */}
      {previewFile && (
        <>
          <div className="fixed inset-0 z-60 bg-black/30 backdrop-blur-xs" onClick={() => setPreviewFile(null)} />
          <div className="fixed z-70 top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-gray-900">{t("assignmentDetail.attachmentPreview")}</h3>
              <button type="button" onClick={() => setPreviewFile(null)} className="text-gray-400 hover:text-gray-600">
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 p-5 text-center">
              <p className="text-[12px] font-semibold text-gray-900">{previewFile}</p>
              <p className="text-[11px] text-gray-400 mt-1.5">
                {t("assignmentDetail.attachmentDescription")}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
