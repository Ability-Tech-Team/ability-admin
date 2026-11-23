"use client";

import { useTranslations } from "next-intl";
import Pagination from "@/src/components/Pagination";
import {
  OWNERSHIP_RENTER,
  canEndAssignment,
  type UnitAssignment,
  type UnitAssignmentsPage,
} from "@/src/services/unitAssignments";
import { initials, otherHolderCount } from "../utils";

type UnitAssignmentTableProps = {
  /** Null until the first page has loaded. */
  data: UnitAssignmentsPage | null;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onView: (assignmentId: number) => void;
  /** Ends an owner's open assignment from today (after the browser's confirm prompt). */
  onEnd: (assignment: UnitAssignment) => void;
  /** The assignment being ended; every switch waits while one is. */
  endingId: number | null;
};

const ownerBadgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";
const tenantBadgeClass = "border border-[#ddd6ff] bg-[#f5f3ff] text-[#7008e9]";
const countBadgeClass = "bg-[#eff6ff] text-[#1447e6]";
const headClass = "px-2 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]";

export default function UnitAssignmentTable({ data, loading, page, onPageChange, onView, onEnd, endingId }: UnitAssignmentTableProps) {
  const t = useTranslations("MasterData");
  const tScreen = useTranslations("UnitAssignmentScreen");
  const assignments = data?.assignments ?? [];

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
      <table className="w-full min-w-[960px] table-fixed" aria-busy={loading}>
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
            <th className={`${headClass} px-3`}>{t("columns.assignmentId")}</th>
            <th className={headClass}>{t("columns.unitNumber")}</th>
            <th className={headClass}>{t("columns.customer")}</th>
            <th className={headClass}>{t("columns.familyMembers")}</th>
            <th className={headClass}>{t("columns.project")}</th>
            <th className={headClass}>{t("columns.occupancyType")}</th>
            <th className={headClass}>{t("columns.startDate")}</th>
            <th className={headClass}>{t("columns.status")}</th>
            <th className={headClass}>{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody className={loading && data ? "opacity-60" : undefined}>
          {assignments.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-10 text-center text-[12px] text-gray-400">
                {loading ? tScreen("loading") : data ? tScreen("empty") : "—"}
              </td>
            </tr>
          )}
          {assignments.map((assignment) => {
            const others = otherHolderCount(assignment.customer.id, assignment.unitCustomers);
            const [firstMember, ...moreMembers] = assignment.familyMembers;
            const renter = assignment.ownership.id === OWNERSHIP_RENTER;

            return (
              <tr key={assignment.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                {/* Assignment ID */}
                <td className="px-3 py-4 text-[11px] text-gray-900">{assignment.id}</td>

                {/* Unit Number */}
                <td className="px-2 py-4 text-[11px] text-gray-900">{assignment.unit.unitNumber}</td>

                {/* Customer */}
                <td className="px-2 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-900">{assignment.customer.name}</span>
                    {others > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${countBadgeClass}`}
                        title={tScreen("otherHolders", { count: others })}
                      >
                        +{others}
                      </span>
                    )}
                  </div>
                </td>

                {/* Family Members */}
                <td className="px-2 py-4">
                  {firstMember ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-400 text-[9px] font-bold text-white">
                        {initials(firstMember.name)}
                      </div>
                      <span className="text-[11px] text-gray-900">{firstMember.name}</span>
                      {moreMembers.length > 0 && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${countBadgeClass}`}>
                          +{moreMembers.length}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-300">—</span>
                  )}
                </td>

                {/* Project */}
                <td className="px-2 py-4 text-[11px] text-gray-900">{assignment.project.name}</td>

                {/* Occupancy Type: the API's own name for the link */}
                <td className="px-2 py-4">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${renter ? tenantBadgeClass : ownerBadgeClass}`}>
                    {assignment.ownership.name}
                  </span>
                </td>

                {/* Start Date */}
                <td className="px-2 py-4 text-[11px] text-gray-600">{assignment.startDate ?? "—"}</td>

                {/* Status: turning an owner's open assignment off ends it from today
                    (POST /admin/customers/end-ownership). An ended one can't be turned back on
                    here, and a tenant's ends through Rental Management. */}
                <td className="px-2 py-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={assignment.active}
                    aria-busy={endingId === assignment.id || undefined}
                    disabled={!canEndAssignment(assignment) || endingId !== null}
                    title={
                      canEndAssignment(assignment)
                        ? undefined
                        : renter && assignment.active
                          ? tScreen("endsInRentals")
                          : tScreen("cannotReactivate")
                    }
                    onClick={() => {
                      if (window.confirm(tScreen("confirmEnd", { customer: assignment.customer.name, unit: assignment.unit.unitNumber }))) {
                        onEnd(assignment);
                      }
                    }}
                    className={`flex items-center gap-1 ${canEndAssignment(assignment) ? "cursor-pointer" : "cursor-not-allowed"}`}
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
                    onClick={() => onView(assignment.id)}
                    className="rounded-md px-2.5 py-1 text-[10px] font-medium text-gray-700 active:bg-gray-100 active:shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    {t("view")}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      {data && (
        <div className="border-t border-gray-100 px-3">
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            onPageChange={onPageChange}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
