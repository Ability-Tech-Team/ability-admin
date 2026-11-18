"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { ServiceItem } from "@/src/services/serviceCatalog";
import ToggleSwitch from "@/src/components/ToggleSwitch";
import FilterDropdown from "@/src/components/FilterDropdown";
import SelectWrapper from "@/src/components/SelectWrapper";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";

type Props = {
  data: ServiceItem[];
  departmentOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
  labels: {
    searchPlaceholder: string;
    exactSearch: string;
    departments: string;
    status: string;
    addService: string;
    baseCost: string;
    serviceName: string;
    department: string;
    description: string;
    baseCostLabel: string;
    save: string;
    cancel: string;
    added: string;
  };
};

export default function ServiceCatalogPageClient({ data, departmentOptions, statusOptions, labels }: Props) {
  const [services, setServices] = useState(data);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    let result = services;
    if (deptFilter.size > 0) {
      result = result.filter((s) => deptFilter.has(s.department.toLowerCase().replace(/\s+/g, "-")));
    }
    if (statusFilter.size > 0) {
      result = result.filter((s) => {
        if (statusFilter.has("active") && s.active) return true;
        if (statusFilter.has("inactive") && !s.active) return true;
        return false;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [services, deptFilter, statusFilter, search]);

  function toggleActive(id: string) {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    );
  }

  return (
    <div className="mx-5 pb-8">
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute start-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="h-9 w-[240px] rounded-lg border border-gray-200 bg-white ps-7 pe-2 text-[10.5px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </div>

          {/* Exact search */}
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input type="checkbox" className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-[12px] text-gray-500">{labels.exactSearch}</span>
          </label>

          {/* Departments filter */}
          <FilterDropdown
            label={labels.departments}
            options={departmentOptions}
            onChange={setDeptFilter}
          />

          {/* Status filter */}
          <FilterDropdown
            label={labels.status}
            options={statusOptions}
            onChange={setStatusFilter}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {labels.addService}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((service) => (
          <div
            key={service.id}
            className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
          >
            {/* Top row: name + toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-gray-900">{service.name}</span>
              <ToggleSwitch checked={service.active} onChange={() => toggleActive(service.id)} />
            </div>

            {/* Department badge */}
            <div>
              <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-600">
                {service.department}
              </span>
            </div>

            {/* Description */}
            <p className="text-[12px] text-gray-500">{service.description}</p>

            {/* Base cost */}
            <p className="text-[12px] text-gray-700">
              {labels.baseCost}: <strong>{service.currency} {service.baseCost}</strong>
            </p>
          </div>
        ))}
      </div>

      {/* Add Service Modal */}
      {showAdd && (
        <ModalWrapper onClose={() => setShowAdd(false)} width="max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-[14px] font-bold text-gray-900">
              {labels.addService}
            </h2>
            <CloseButton onClick={() => setShowAdd(false)} />
          </div>
          {/* Body */}
          <div className="flex flex-col gap-3 px-6 py-5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">{labels.serviceName}</label>
              <input
                type="text"
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">{labels.department}</label>
              <SelectWrapper>
                <select className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white ps-3 pe-10 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
                  {departmentOptions.map((opt) => (
                    <option key={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </SelectWrapper>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">{labels.description}</label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">{labels.baseCostLabel}</label>
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
