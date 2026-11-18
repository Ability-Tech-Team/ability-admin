"use client";

import { useTranslations } from "next-intl";
import DetailPanel from "@/src/components/DetailPanel";
import type { Complaint } from "@/src/services/complaints";

type Props = {
  complaint: Complaint;
  onClose: () => void;
};

const priorityBadge: Record<string, string> = {
  low: "border-gray-300 text-gray-500",
  medium: "border-yellow-300 bg-yellow-50 text-yellow-700",
  high: "border-red-300 bg-red-50 text-red-600",
};

const statusBadge: Record<string, string> = {
  "in-progress": "border-blue-300 text-blue-600",
  open: "border-emerald-300 text-emerald-600",
  resolved: "border-emerald-300 text-emerald-600",
};

export default function ComplaintDetail({ complaint, onClose }: Props) {
  const t = useTranslations("Operations");

  return (
    <DetailPanel title={complaint.complaintId} onClose={onClose}>
      <div className="flex flex-col gap-5 p-5">
        {/* Title + description + badges */}
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">{complaint.subject}</h3>
          <p className="text-[12px] text-gray-500 mt-1">{complaint.fullDescription}</p>
          <div className="mt-2.5 flex items-center gap-2">
            <span className={`rounded-full border px-3 py-0.5 text-[11px] font-medium ${priorityBadge[complaint.priority] ?? ""}`}>
              {t(`complaint.priorities.${complaint.priority}` as Parameters<typeof t>[0])}
            </span>
            <span className={`rounded-full border px-3 py-0.5 text-[11px] font-medium ${statusBadge[complaint.status] ?? ""}`}>
              {t(`statuses.${complaint.status}` as Parameters<typeof t>[0])}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard label={t("detail.project")} value={complaint.project} />
          <InfoCard label={t("detail.unit")} value={complaint.unit} />
          <InfoCard label={t("complaintDetail.submittedBy")} value={complaint.submittedBy} />
          <InfoCard label={t("detail.assignedTo")} value={complaint.assignedTo} />
          <InfoCard label={t("detail.created")} value={complaint.date} />
        </div>

        {/* Priority & Status row */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard label={t("complaint.columns.priority")} value={t(`complaint.priorities.${complaint.priority}` as Parameters<typeof t>[0])} />
          <InfoCard label={t("columns.status")} value={t(`statuses.${complaint.status}` as Parameters<typeof t>[0])} />
        </div>

        {/* Ticket Timeline */}
        <div>
          <h4 className="text-[12px] font-semibold text-gray-900 mb-3">{t("complaintDetail.ticketTimeline")}</h4>
          <div className="flex flex-col">
            {complaint.timeline.map((entry, i) => (
              <div key={i} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-blue-500 bg-white" />
                  {i < complaint.timeline.length - 1 && (
                    <span className="w-px flex-1 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-900">{entry.action}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{entry.detail}</p>
                  <p className="text-[10px] text-gray-400">{entry.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice note player */}
        {complaint.hasVoiceNote && (
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <PlayIcon className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-900">{t("complaintDetail.customerVoiceNote")}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-400">00:00</span>
                <div className="flex-1 h-1 rounded-full bg-gray-200">
                  <div className="h-full w-0 rounded-full bg-blue-500" />
                </div>
                <span className="text-[10px] text-gray-400">{complaint.voiceNoteDuration}</span>
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <h4 className="text-[12px] font-semibold text-gray-900 mb-2">{t("complaintDetail.comments")}</h4>
          <p className="text-[11px] text-gray-400 mb-3">{t("complaintDetail.noComments")}</p>
          <textarea
            placeholder={t("complaintDetail.writeComment")}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[11px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors">
              {t("complaintDetail.addComment")}
            </button>
          </div>
        </div>
      </div>
    </DetailPanel>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
      <p className="text-[10.5px] font-semibold text-gray-500 mb-0.5">{label}</p>
      <p className="text-[12px] font-medium text-gray-700">{value}</p>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
    </svg>
  );
}
