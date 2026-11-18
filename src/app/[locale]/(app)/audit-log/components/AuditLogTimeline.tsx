"use client";

import type { AuditLogEntry } from "@/src/services/auditLog";

type Props = {
  data: AuditLogEntry[];
};

export default function AuditLogTimeline({ data }: Props) {
  return (
    <div className="mx-5 rounded-xl border border-gray-100 bg-white shadow-sm px-6 py-4">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute start-[18px] top-0 bottom-0 w-px bg-gray-200" />

        <div className="flex flex-col gap-6">
          {data.map((entry) => (
            <div key={entry.id} className="relative flex gap-4 ps-12">
              {/* Avatar on the line */}
              <div
                className={`absolute start-0 top-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-4 ring-white ${entry.userInitialsColor}`}
              >
                {entry.userInitials}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1">
                {/* Top row: name + action + module */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-bold text-gray-900">
                    {entry.userName}
                  </span>
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${entry.actionColor}`}>
                    {entry.action}
                  </span>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${entry.moduleBadgeColor}`}
                  >
                    {entry.module}
                  </span>
                </div>

                {/* Detail */}
                <p className="text-[11px] text-gray-600">{entry.detail}</p>

                {/* Timestamp + IP */}
                <p className="text-[10px] text-gray-400">
                  {entry.timestamp}
                  <span className="mx-1.5">&middot;</span>
                  {entry.ipAddress}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
