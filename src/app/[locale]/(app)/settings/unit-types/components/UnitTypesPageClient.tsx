"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { UnitType } from "@/src/services/unitTypes";
import ToggleSwitch from "@/src/components/ToggleSwitch";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";

type Props = {
  data: UnitType[];
  labels: {
    addUnitType: string;
    unitType: string;
    arabicName: string;
    defaultAnnualRent: string;
    status: string;
    active: string;
    inactive: string;
    nameEn: string;
    nameAr: string;
    rent: string;
    save: string;
    cancel: string;
    added: string;
  };
};

export default function UnitTypesPageClient({ data, labels }: Props) {
  const [units, setUnits] = useState(data);
  const [showAdd, setShowAdd] = useState(false);

  function toggleActive(id: string) {
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    );
  }

  return (
    <div className="mx-5 pb-8">
      {/* Add button */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {labels.addUnitType}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-start">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-5 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {labels.unitType}
              </th>
              <th className="px-5 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {labels.arabicName}
              </th>
              <th className="px-5 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {labels.defaultAnnualRent}
              </th>
              <th className="px-5 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {labels.status}
              </th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr
                key={unit.id}
                className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
              >
                <td className="px-5 py-3.5 text-[12px] font-semibold text-gray-900">
                  {unit.nameEn}
                </td>
                <td className="px-5 py-3.5 text-[12px] text-gray-500" dir="rtl">
                  {unit.nameAr}
                </td>
                <td className="px-5 py-3.5 text-[12px] text-gray-700">
                  {unit.currency} {unit.defaultAnnualRent.toLocaleString()}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <ToggleSwitch
                      checked={unit.active}
                      onChange={() => toggleActive(unit.id)}
                    />
                    <span
                      className={`text-[11px] font-medium ${
                        unit.active ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {unit.active ? labels.active : labels.inactive}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Unit Type Modal */}
      {showAdd && (
        <ModalWrapper onClose={() => setShowAdd(false)} width="max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-[14px] font-bold text-gray-900">
              {labels.addUnitType}
            </h2>
            <CloseButton onClick={() => setShowAdd(false)} />
          </div>
          {/* Body */}
          <div className="flex flex-col gap-3 px-6 py-5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">{labels.nameEn}</label>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">{labels.nameAr}</label>
              <input
                type="text"
                dir="rtl"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">{labels.rent}</label>
              <input
                type="number"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-lg border border-gray-200 px-4 py-1.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {labels.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success(labels.added);
                setShowAdd(false);
              }}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              {labels.save}
            </button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
