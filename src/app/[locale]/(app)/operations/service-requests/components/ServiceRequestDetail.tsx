"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { ServiceRequest } from "@/src/services/serviceRequests";

type Props = {
  request: ServiceRequest;
  onClose: () => void;
};

const statusStyles: Record<string, string> = {
  "in-progress": "border-blue-300 text-blue-600",
  open: "border-emerald-300 text-emerald-600",
  resolved: "border-emerald-300 text-emerald-600",
  delayed: "border-red-300 text-red-500",
};

const statusOptions = ["open", "in-progress", "delayed", "resolved"] as const;

export default function ServiceRequestDetail({ request, onClose }: Props) {
  const t = useTranslations("Operations");
  const [status, setStatus] = useState(request.status);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 end-0 z-50 flex w-[480px] flex-col bg-white shadow-xl overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-[14px] font-bold text-gray-900">{request.requestId}</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Title + badges */}
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">{request.title}</h3>
            <div className="mt-2 flex items-center gap-2">
              <span className={`rounded-full border px-3 py-0.5 text-[11px] font-medium ${statusStyles[request.status] ?? ""}`}>
                {t(`statuses.${request.status}` as Parameters<typeof t>[0])}
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[11px] font-medium text-blue-600">
                {request.subcategory}
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={t("detail.project")} value={request.project} />
            <InfoCard label={t("detail.unit")} value={request.unit} />
            <InfoCard label={t("detail.customer")} value={request.customer} />
            <InfoCard label={t("detail.type")} value={request.type} />
            <InfoCard label={t("detail.assignedTo")} value={request.assignedTo} />
            <InfoCard label={t("detail.created")} value={request.createdDate} />
            <div className="col-span-2">
              <InfoCard label={t("detail.dueDateAndTime")} value={`${request.dueDate} ${request.dueTime}`} />
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <h4 className="text-[12px] font-semibold text-gray-900 mb-3">{t("detail.activityTimeline")}</h4>
            <div className="flex flex-col gap-0">
              {request.timeline.map((entry, i) => (
                <div key={i} className="flex gap-3 pb-4 last:pb-0">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                    {i < request.timeline.length - 1 && (
                      <span className="w-px flex-1 bg-gray-200 mt-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-gray-900">{entry.action}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {entry.actor} · {entry.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Comment */}
          <div>
            <h4 className="text-[12px] font-semibold text-gray-900 mb-2">{t("detail.addComment")}</h4>
            <textarea
              placeholder={t("detail.commentPlaceholder")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
              rows={3}
            />
          </div>

          {/* Status dropdown */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-[12px] font-medium text-gray-900">{t("columns.status")}</span>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {t(`statuses.${status}` as Parameters<typeof t>[0])}
              </button>
              {dropdownOpen && (
                <div className="absolute bottom-full mb-1 min-w-max rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-10 end-0">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setStatus(opt); setDropdownOpen(false); }}
                      className={`flex w-full items-center whitespace-nowrap px-3 py-1.5 text-[13px] transition-colors ${
                        opt === status ? "bg-blue-50 font-medium text-gray-900" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {t(`statuses.${opt}` as Parameters<typeof t>[0])}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
      <p className="text-[11px] font-semibold text-gray-400 mb-0.5">{label}</p>
      <p className="text-[12px] font-semibold text-gray-700">{value}</p>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
