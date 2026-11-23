"use client";

import { useTranslations } from "next-intl";
import DetailPanel from "@/src/components/DetailPanel";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import {
  OWNERSHIP_RENTER,
  type UnitAssignment,
  type UnitAssignmentDetail as Detail,
} from "@/src/services/unitAssignments";

type UnitAssignmentDetailProps = {
  /** The list's row, shown while the detail loads; null when it isn't on this page. */
  summary: UnitAssignment | null;
  detail: Detail | null;
  loading: boolean;
  failure: ApiFailure | null;
  onRetry: () => void;
  onClose: () => void;
};

const ownerBadgeClass = "bg-[#eff6ff] border border-[#bedbff] text-[#1447e6]";
const tenantBadgeClass = "bg-[#f5f3ff] border border-[#ddd6ff] text-[#7008e9]";
const activeBadgeClass = "bg-green-50 border border-green-200 text-green-600";
const inactiveBadgeClass = "bg-gray-50 border border-gray-200 text-gray-500";

/** One assignment: its contract, everyone holding the unit, and the customer's family on it. */
export default function UnitAssignmentDetail({ summary, detail, loading, failure, onRetry, onClose }: UnitAssignmentDetailProps) {
  const t = useTranslations("MasterData");
  const tScreen = useTranslations("UnitAssignmentScreen");
  const assignment: UnitAssignment | null = detail ?? summary;

  const title = assignment
    ? `${t("unitAssignment")} · ${assignment.project.name} · ${tScreen("unitLabel", { number: assignment.unit.unitNumber })}`
    : t("unitAssignment");

  const field = (label: string, value: string | null) => (
    <div className="bg-gray-50 rounded-md px-2 py-1">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-[11px] text-gray-900 mt-0.5 break-words">{value || "—"}</p>
    </div>
  );

  return (
    <DetailPanel title={title} onClose={onClose} width="w-[480px] max-w-full" closeLabel={tScreen("close")}>
        <div className="p-5 space-y-6">
          {failure && (
            <ApiFailureNotice failure={failure} onRetry={onRetry} messages={{ forbidden: tScreen("forbidden") }} />
          )}
          {!assignment && loading && <p className="text-[12px] text-gray-400">{tScreen("loading")}</p>}

          {assignment && (
            <>
              {/* The assignment */}
              <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900">{assignment.customer.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{tScreen("assignmentNumber", { id: assignment.id })}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${assignment.ownership.id === OWNERSHIP_RENTER ? tenantBadgeClass : ownerBadgeClass}`}>
                      {assignment.ownership.name}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${assignment.active ? activeBadgeClass : inactiveBadgeClass}`}>
                      {assignment.active ? t("active") : t("inactive")}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {field(t("assignmentDetail.assignmentStart"), assignment.startDate)}
                  {field(tScreen("endDate"), assignment.endDate)}
                  {field(tScreen("signDate"), detail?.signDate ?? null)}
                  {field(tScreen("contractNumber"), detail?.contractNumber ?? null)}
                </div>
                {detail?.notes && <div className="mt-2">{field(tScreen("notes"), detail.notes)}</div>}
                {loading && !detail && <p className="mt-2 text-[10px] text-gray-400">{tScreen("loading")}</p>}
              </div>

              {/* Customers Assigned to Unit */}
              <div>
                <h3 className="text-[12px] font-bold text-gray-900 mb-3">{t("assignmentDetail.customersAssigned")}</h3>
                {assignment.unitCustomers.length === 0 ? (
                  <p className="text-[11px] text-gray-400">{tScreen("noCurrentHolders")}</p>
                ) : (
                  <ul className="space-y-2">
                    {assignment.unitCustomers.map((customer) => (
                      <li key={customer.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm">
                        <span className="text-[12px] font-semibold text-gray-900">{customer.name}</span>
                        {customer.id === assignment.customer.id && (
                          <span className="text-[10px] text-gray-400">{tScreen("thisAssignment")}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Family Members */}
              {assignment.familyMembers.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-semibold text-gray-900 mb-3">{t("assignmentDetail.familyMembersTitle")}</h3>
                  <ul className="space-y-2">
                    {assignment.familyMembers.map((member) => (
                      <li key={member.id} className="flex items-start justify-between rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm">
                        <div>
                          <p className="text-[12px] font-semibold text-gray-900">{member.name}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {t("assignmentDetail.relationship")}: {member.relation || "—"}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${member.active ? activeBadgeClass : inactiveBadgeClass}`}>
                          {member.active ? t("active") : t("inactive")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
    </DetailPanel>
  );
}
