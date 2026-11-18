"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { SlaRule } from "@/src/services/slaRules";
import SelectWrapper from "@/src/components/SelectWrapper";
import ModalWrapper from "@/src/components/ModalWrapper";
import CloseButton from "@/src/components/CloseButton";

type Props = {
  data: SlaRule[];
  labels: {
    addSlaRule: string;
    service: string;
    priority: string;
    sla: string;
    escalationTo: string;
    actions: string;
    edit: string;
    hrs: string;
    serviceName: string;
    priorityLabel: string;
    slaHours: string;
    escalationLabel: string;
    save: string;
    cancel: string;
    added: string;
    updated: string;
  };
};

const priorityStyles: Record<SlaRule["priority"], string> = {
  critical: "border-red-200 bg-red-50 text-red-600",
  high: "border-orange-200 bg-orange-50 text-orange-600",
  medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
  low: "border-gray-200 bg-gray-50 text-gray-500",
};

export default function SlaRulesPageClient({ data, labels }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<SlaRule | null>(null);

  return (
    <div className="mx-5 pb-8">
      {/* Add button */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {labels.addSlaRule}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-start">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-5 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {labels.service}
              </th>
              <th className="px-5 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {labels.priority}
              </th>
              <th className="px-5 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {labels.sla}
              </th>
              <th className="px-5 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {labels.escalationTo}
              </th>
              <th className="px-5 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {labels.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((rule) => (
              <tr
                key={rule.id}
                className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
              >
                <td className="px-5 py-3.5 text-[12px] font-semibold text-gray-900">
                  {rule.service}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${priorityStyles[rule.priority]}`}
                  >
                    {rule.priority.charAt(0).toUpperCase() + rule.priority.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[12px] font-mono text-gray-600">
                  {rule.slaHours} {labels.hrs}
                </td>
                <td className="px-5 py-3.5 text-[12px] text-gray-700">
                  {rule.escalationTo}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => setEditing(rule)}
                    className="text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {labels.edit}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {(showAdd || editing) && (
        <ModalWrapper onClose={() => { setShowAdd(false); setEditing(null); }} width="max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-[14px] font-bold text-gray-900">
              {editing ? `${labels.edit} SLA Rule` : labels.addSlaRule}
            </h2>
            <CloseButton onClick={() => { setShowAdd(false); setEditing(null); }} />
          </div>
          {/* Body */}
          <div className="flex flex-col gap-3 px-6 py-5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">{labels.serviceName}</label>
              <input
                type="text"
                defaultValue={editing?.service ?? ""}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">{labels.priorityLabel}</label>
              <SelectWrapper>
                <select
                  defaultValue={editing?.priority ?? "medium"}
                  className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white ps-3 pe-10 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </SelectWrapper>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">{labels.slaHours}</label>
              <input
                type="number"
                defaultValue={editing?.slaHours ?? ""}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500">{labels.escalationLabel}</label>
              <input
                type="text"
                defaultValue={editing?.escalationTo ?? ""}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={() => { setShowAdd(false); setEditing(null); }}
              className="rounded-lg border border-gray-200 px-4 py-1.5 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {labels.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success(editing ? labels.updated : labels.added);
                setShowAdd(false);
                setEditing(null);
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
