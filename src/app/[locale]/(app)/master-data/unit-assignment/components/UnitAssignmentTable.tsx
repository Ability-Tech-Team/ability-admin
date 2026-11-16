"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { UnitAssignment } from "@/src/services/unitAssignments";
import UnitAssignmentDetail from "./UnitAssignmentDetail";

type UnitAssignmentTableProps = {
  data: UnitAssignment[];
};

const ownerBadgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";
const tenantBadgeClass = "border border-[#ddd6ff] bg-[#f5f3ff] text-[#7008e9]";
const countBadgeClass = "bg-[#eff6ff] text-[#1447e6]";

export default function UnitAssignmentTable({ data }: UnitAssignmentTableProps) {
  const t = useTranslations("MasterData");
  const [assignments, setAssignments] = useState(data);
  const [selectedAssignment, setSelectedAssignment] = useState<UnitAssignment | null>(null);

  function toggleActive(id: string) {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-[100px]" />
          <col className="w-[90px]" />
          <col className="w-[150px]" />
          <col className="w-[170px]" />
          <col className="w-[120px]" />
          <col className="w-[100px]" />
          <col className="w-[85px]" />
          <col className="w-[90px]" />
          <col className="w-[55px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-3 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.assignmentId")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.unitNumber")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.customer")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.familyMembers")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.project")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.occupancyType")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.startDate")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.status")}</th>
            <th className="px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              {/* Assignment ID */}
              <td className="px-3 py-4 text-[11px] text-gray-900">{assignment.assignmentId}</td>

              {/* Unit Number */}
              <td className="px-2 py-4 text-[11px] text-gray-900">{assignment.unitNumber}</td>

              {/* Customer */}
              <td className="px-2 py-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-900">{assignment.customerName}</span>
                  {assignment.customerExtra && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${countBadgeClass}`}>
                      +{assignment.customerExtra}
                    </span>
                  )}
                </div>
              </td>

              {/* Family Members */}
              <td className="px-2 py-4">
                {assignment.familyMember ? (
                  <div className="flex items-center gap-1.5">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${assignment.familyMember.avatarColor}`}>
                      {assignment.familyMember.initials}
                    </div>
                    <span className="text-[11px] text-gray-900">{assignment.familyMember.name}</span>
                    {assignment.familyExtra && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${countBadgeClass}`}>
                        +{assignment.familyExtra}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-300">—</span>
                )}
              </td>

              {/* Project */}
              <td className="px-2 py-4 text-[11px] text-gray-900">{assignment.project}</td>

              {/* Occupancy Type */}
              <td className="px-2 py-4">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${assignment.occupancyType === "tenant" ? tenantBadgeClass : ownerBadgeClass}`}>
                  {t(`customerTypes.${assignment.occupancyType}` as Parameters<typeof t>[0])}
                </span>
              </td>

              {/* Start Date */}
              <td className="px-2 py-4 text-[11px] text-gray-600">{assignment.startDate}</td>

              {/* Status */}
              <td className="px-2 py-4">
                <button
                  type="button"
                  onClick={() => toggleActive(assignment.id)}
                  className="flex items-center gap-1"
                >
                  <div className={`relative h-[14px] w-[26px] shrink-0 rounded-full transition-colors ${assignment.active ? "bg-blue-500" : "bg-gray-200"}`}>
                    <div className={`absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white shadow-sm transition-all ${assignment.active ? "start-[14px]" : "start-[2px]"}`} />
                  </div>
                  <span className={`text-[10px] font-medium ${assignment.active ? "text-gray-700" : "text-gray-400"}`}>
                    {assignment.active ? t("active") : t("inactive")}
                  </span>
                </button>
              </td>

              {/* Actions */}
              <td className="px-2 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(assignment)}
                  className="rounded-md px-2.5 py-1 text-[10px] font-medium text-gray-700 active:bg-gray-100 active:shadow-sm hover:bg-gray-50 transition-colors"
                >
                  {t("view")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-3">
        <span className="text-[10px] text-gray-400">
          {t("showing", { from: 1, to: assignments.length, total: assignments.length })}
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

      {/* Detail side panel */}
      {selectedAssignment && (
        <UnitAssignmentDetail
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
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
