"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { UnitAssignment } from "@/src/services/unitAssignments";

type UnitAssignmentDetailProps = {
  assignment: UnitAssignment;
  onClose: () => void;
};

const roleBadgeClass: Record<string, string> = {
  owner: "bg-[#eff6ff] border border-[#bedbff] text-[#1447e6]",
  "co-owner": "bg-[#eff6ff] border border-[#bedbff] text-[#1447e6]",
  tenant: "bg-[#f5f3ff] border border-[#ddd6ff] text-[#7008e9]",
};

export default function UnitAssignmentDetail({ assignment, onClose }: UnitAssignmentDetailProps) {
  const t = useTranslations("MasterData");
  const { detail } = assignment;
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xs" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 end-0 z-50 w-[480px] overflow-y-auto bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-[13px] font-bold text-gray-900">
            {t("unitAssignment")} · {assignment.project} · Unit {assignment.unitNumber}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Customers Assigned to Unit */}
          <div>
            <h3 className="text-[12px] font-bold text-gray-900 mb-3">{t("assignmentDetail.customersAssigned")}</h3>
            <div className="space-y-3">
              {detail.customers.map((customer) => (
                <div key={customer.email} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                  {/* Name + Badges */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[12px] font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{customer.nameAr}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize ${roleBadgeClass[customer.role]}`}>
                        {t(`assignmentDetail.roles.${customer.role}` as Parameters<typeof t>[0])}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${customer.active ? "bg-green-50 border border-green-200 text-green-600" : "bg-gray-50 border border-gray-200 text-gray-500"}`}>
                        {customer.active ? t("active") : t("inactive")}
                      </span>
                    </div>
                  </div>

                  {/* Detail rows */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-md px-2 py-1">
                        <p className="text-[10px] text-gray-400">{t("assignmentDetail.nationalId")}</p>
                        <p className="text-[11px] text-gray-900 mt-0.5">{customer.nationalId}</p>
                      </div>
                      <div className="bg-gray-50 rounded-md px-2 py-1">
                        <p className="text-[10px] text-gray-400">{t("assignmentDetail.mobile")}</p>
                        <p className="text-[11px] text-gray-900 mt-0.5">{customer.mobile}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-md px-2 py-1">
                        <p className="text-[10px] text-gray-400">{t("assignmentDetail.email")}</p>
                        <p className="text-[11px] text-gray-900 mt-0.5">{customer.email}</p>
                      </div>
                      <div className="bg-gray-50 rounded-md px-2 py-1">
                        <p className="text-[10px] text-gray-400">{t("assignmentDetail.nationality")}</p>
                        <p className="text-[11px] text-gray-900 mt-0.5">{customer.nationality}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-md px-2 py-1">
                      <p className="text-[10px] text-gray-400">{t("assignmentDetail.assignmentStart")}</p>
                      <p className="text-[11px] text-gray-900 mt-0.5">{customer.assignmentStart}</p>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-[10px] font-medium text-gray-500">{t("assignmentDetail.attachments")}:</span>
                    {customer.attachments.map((file) => (
                      <button
                        key={file}
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        {file}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Family Members */}
          {detail.familyMembers.length > 0 && (
            <div>
              <h3 className="text-[12px] font-semibold text-gray-900 mb-3">{t("assignmentDetail.familyMembersTitle")}</h3>
              <div className="space-y-3">
                {detail.familyMembers.map((member) => (
                  <div key={member.email} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                    {/* Name + Badge */}
                    <div className="flex items-start justify-between mb-0.5">
                      <div>
                        <p className="text-[12px] font-semibold text-gray-900">{member.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{member.relationship}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${member.status === "approved" ? "border border-green-400 text-green-600" : "border border-yellow-400 text-yellow-600"}`}>
                        {t(`assignmentDetail.statuses.${member.status}` as Parameters<typeof t>[0])}
                      </span>
                    </div>

                    {/* Detail rows */}
                    <div className="space-y-2 mt-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-md px-2 py-1">
                          <p className="text-[10px] text-gray-400">{t("assignmentDetail.nationalId")}</p>
                          <p className="text-[11px] text-gray-900 mt-0.5">{member.nationalId}</p>
                        </div>
                        <div className="bg-gray-50 rounded-md px-2 py-1">
                          <p className="text-[10px] text-gray-400">{t("assignmentDetail.mobile")}</p>
                          <p className="text-[11px] text-gray-900 mt-0.5">{member.mobile}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-md px-2 py-1">
                          <p className="text-[10px] text-gray-400">{t("assignmentDetail.email")}</p>
                          <p className="text-[11px] text-gray-900 mt-0.5">{member.email}</p>
                        </div>
                        <div className="bg-gray-50 rounded-md px-2 py-1">
                          <p className="text-[10px] text-gray-400">{t("assignmentDetail.relationship")}</p>
                          <p className="text-[11px] text-gray-900 mt-0.5">{member.relationship}</p>
                        </div>
                      </div>
                    </div>

                    {/* Attachments */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-[10px] font-medium text-gray-500">{t("assignmentDetail.attachments")}:</span>
                      {member.attachments.map((file) => (
                        <button
                          key={file}
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          {file}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
    </>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
