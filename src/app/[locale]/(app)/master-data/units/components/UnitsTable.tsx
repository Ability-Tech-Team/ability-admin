"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Unit } from "@/src/services/units";

type UnitsTableProps = {
  data: Unit[];
};

const contractBadgeClass = "border border-[#bedbff] bg-[#eff6ff] text-[#1447e6]";

export default function UnitsTable({ data }: UnitsTableProps) {
  const t = useTranslations("MasterData");
  const [toggledIds, setToggledIds] = useState<Set<string>>(new Set());

  const units = useMemo(() =>
    data.map((u) => toggledIds.has(u.id) ? { ...u, active: !u.active } : u),
    [data, toggledIds]
  );

  function toggleActive(id: string) {
    setToggledIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <table className="w-full">
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
          {units.map((unit) => (
            <tr key={unit.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              {/* Unit ID */}
              <td className="px-5 py-3 text-[11px] text-gray-400">{unit.unitId}</td>

              {/* Unit Number */}
              <td className="px-4 py-3">
                <p className="text-[12px] font-semibold text-gray-900">{unit.number}</p>
                <p className="text-[10px] text-gray-400">{unit.type}</p>
              </td>

              {/* Project / Building */}
              <td className="px-4 py-3">
                <p className="text-[11px] text-gray-900">{unit.project}</p>
                <p className="text-[10px] text-gray-400">{unit.building}</p>
              </td>

              {/* Current Owner */}
              <td className="px-4 py-3">
                {unit.owner ? (
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${unit.owner.color}`}>
                      {unit.owner.initials}
                    </div>
                    <span className="text-[11px] text-gray-700">{unit.owner.name}</span>
                    {unit.owner.extra && (
                      <span className="rounded-full bg-[#eff6ff] px-1.5 py-0.5 text-[9px] font-bold text-[#1447e6]">
                        +{unit.owner.extra}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-300">—</span>
                )}
              </td>

              {/* Contract */}
              <td className="px-4 py-3">
                {unit.contract ? (
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-medium ${contractBadgeClass}`}>
                    {t(`contractTypes.${unit.contract}` as Parameters<typeof t>[0])}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-300">—</span>
                )}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleActive(unit.id)}
                  className="flex items-center gap-1.5"
                >
                  <div className={`relative h-[14px] w-[26px] rounded-full transition-colors ${unit.active ? "bg-blue-500" : "bg-gray-200"}`}>
                    <div className={`absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white shadow-sm transition-all ${unit.active ? "start-[14px]" : "start-[2px]"}`} />
                  </div>
                  <span className={`text-[10px] font-medium ${unit.active ? "text-gray-700" : "text-gray-400"}`}>
                    {unit.active ? t("active") : t("inactive")}
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <span className="text-[10px] text-gray-400">
          {t("showing", { from: 1, to: units.length, total: units.length })}
        </span>
        <div className="flex items-center gap-1">
          <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100">
            <ChevronLeftIcon className="h-3 w-3" />
          </button>
          <button type="button" className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[10px] font-medium text-white">
            1
          </button>
          <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-gray-100">
            <ChevronRightIcon className="h-3 w-3" />
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
