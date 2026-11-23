"use client";

import { useTranslations } from "next-intl";
import type { Unit, UnitsPage } from "@/src/services/units";
import { ownerColor, ownerInitials } from "../utils";

type UnitsTableProps = {
  /** Null until the first page has loaded. */
  data: UnitsPage | null;
  loading: boolean;
  /** The list couldn't be loaded: the table shows "—" instead of "Loading…". */
  failed: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Turns the unit on or off (`PUT /units/:id`). */
  onToggle: (unit: Unit) => void;
  /** The unit being changed; every switch waits while one is. */
  togglingId: number | null;
};

const contractBadgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";

export default function UnitsTable({ data, loading, failed, page, pageSize, onPageChange, onToggle, togglingId }: UnitsTableProps) {
  const t = useTranslations("MasterData");
  const tUnits = useTranslations("UnitsScreen");
  const units = data?.units ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const from = units.length > 0 ? (page - 1) * pageSize + 1 : 0;
  const to = units.length > 0 ? from + units.length - 1 : 0;

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <table className="w-full" aria-busy={loading}>
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.unitId")}</th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.unitNumber")}</th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.projectBuilding")}</th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.currentOwner")}</th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.contract")}</th>
            <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-[#627892]">{t("columns.status")}</th>
          </tr>
        </thead>
        <tbody>
          {units.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-[12px] text-gray-400">
                {failed ? "—" : loading || !data ? tUnits("loading") : tUnits("empty")}
              </td>
            </tr>
          )}
          {units.map((unit) => {
            const [owner, ...others] = unit.owners;
            const building = [
              unit.subProjectCode,
              unit.floor !== null ? tUnits("floor", { floor: unit.floor }) : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <tr key={unit.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                {/* Unit ID */}
                <td className="px-5 py-3 text-[11px] text-gray-400">{unit.id}</td>

                {/* Unit Number */}
                <td className="px-4 py-3">
                  <p className="text-[12px] font-semibold text-gray-900">{unit.unitNumber}</p>
                  <p className="text-[10px] text-gray-400">{unit.unitTypeName ?? "—"}</p>
                </td>

                {/* Project / Building */}
                <td className="px-4 py-3">
                  <p className="text-[11px] text-gray-900">{unit.projectName ?? "—"}</p>
                  <p className="text-[10px] text-gray-400">{building || "—"}</p>
                </td>

                {/* Current Owner */}
                <td className="px-4 py-3">
                  {owner ? (
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${ownerColor(owner.customerId)}`}>
                        {ownerInitials(owner.name)}
                      </div>
                      <span className="text-[11px] text-gray-700">{owner.name}</span>
                      {others.length > 0 && (
                        <span className="rounded-full bg-[#eff6ff] px-1.5 py-0.5 text-[9px] font-bold text-[#1447e6]">
                          +{others.length}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-300">—</span>
                  )}
                </td>

                {/* Contract: the owner's contract number */}
                <td className="px-4 py-3">
                  {owner?.contractNumber ? (
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-medium ${contractBadgeClass}`}>
                      {owner.contractNumber}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-300">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={unit.isActive}
                    onClick={() => onToggle(unit)}
                    disabled={togglingId !== null}
                    className="flex items-center gap-1.5 disabled:cursor-wait"
                  >
                    <div className={`relative h-[14px] w-[26px] rounded-full transition-colors ${unit.isActive ? "bg-blue-500" : "bg-gray-200"} ${togglingId === unit.id ? "opacity-50" : ""}`}>
                      <div className={`absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white shadow-sm transition-all ${unit.isActive ? "start-[14px]" : "start-[2px]"}`} />
                    </div>
                    <span className={`text-[10px] font-medium ${unit.isActive ? "text-gray-700" : "text-gray-400"}`}>
                      {unit.isActive ? t("active") : t("inactive")}
                    </span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <span className="text-[10px] text-gray-400">
          {t("showing", { from, to, total: totalCount })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={loading || page <= 1}
            aria-label={tUnits("previousPage")}
            className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-3 w-3 rtl:rotate-180" />
          </button>
          <button type="button" aria-current="page" className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[10px] font-medium text-white">
            {page}
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={loading || page >= totalPages}
            aria-label={tUnits("nextPage")}
            className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRightIcon className="h-3 w-3 rtl:rotate-180" />
          </button>
        </div>
      </div>
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
