"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Department } from "@/src/services/departments";
import ToggleSwitch from "@/src/components/ToggleSwitch";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";

type Props = {
  data: Department[];
  labels: {
    addDepartment: string;
    head: string;
    staff: string;
    active: string;
    inactive: string;
    added: string;
    nameEn: string;
    nameAr: string;
    headLabel: string;
    save: string;
    cancel: string;
  };
};

export default function DepartmentsPageClient({ data, labels }: Props) {
  const [departments, setDepartments] = useState(data);
  const [showAdd, setShowAdd] = useState(false);

  function toggleActive(id: string) {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d)),
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
          {labels.addDepartment}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
          >
            {/* Top row: name + toggle */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-gray-900">
                  {dept.nameEn}
                </span>
                <span className="text-[11px] text-gray-400">{dept.nameAr}</span>
              </div>
              <div className="flex items-center gap-2">
                <ToggleSwitch checked={dept.active} onChange={() => toggleActive(dept.id)} />
                <span
                  className={`text-[11px] font-medium ${
                    dept.active ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {dept.active ? labels.active : labels.inactive}
                </span>
              </div>
            </div>

            {/* Bottom row: head + staff */}
            <div className="flex items-center gap-4 text-[12px] text-gray-600">
              <span>
                {labels.head}: <strong>{dept.head}</strong>
              </span>
              <span>
                {labels.staff}: <strong>{dept.staff}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showAdd && (
        <ModalWrapper onClose={() => setShowAdd(false)} width="max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-[14px] font-bold text-gray-900">
              {labels.addDepartment}
            </h2>
            <CloseButton onClick={() => setShowAdd(false)} />
          </div>
          {/* Body */}
          <div className="flex flex-col gap-3 px-6 py-5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">
                {labels.nameEn}
              </label>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">
                {labels.nameAr}
              </label>
              <input
                type="text"
                dir="rtl"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">
                {labels.headLabel}
              </label>
              <input
                type="text"
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
