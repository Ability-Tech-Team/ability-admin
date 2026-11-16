"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Rental } from "@/src/services/rentals";

type RentalDetailProps = {
  rental: Rental;
  onClose: () => void;
};

const statusClass: Record<string, string> = {
  pending: "border border-yellow-300 bg-yellow-50 text-yellow-600",
  approved: "border border-green-300 bg-green-50 text-green-600",
  rejected: "border border-red-300 bg-red-50 text-red-600",
};

export default function RentalDetail({ rental, onClose }: RentalDetailProps) {
  const t = useTranslations("MasterData");
  const [showAttachments, setShowAttachments] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xs" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 end-0 z-50 w-[480px] overflow-y-auto bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-[13px] font-bold text-gray-900">
            {t("rentalDetail.tenantsOn")} {rental.project} – {rental.unit}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
            {/* Name + Status */}
            <div className="flex items-start justify-between mb-1">
              <p className="text-[12px] font-semibold text-gray-900">{rental.tenantName}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusClass[rental.status]}`}>
                {t(`familyColumns.statuses.${rental.status}` as Parameters<typeof t>[0])}
              </span>
            </div>

            {/* Subtitle */}
            <p className="text-[11px] text-gray-400 mb-3">
              {rental.idNumber} · {rental.startDate} to {rental.endDate}
            </p>

            {/* Show Attachments button */}
            <button
              type="button"
              onClick={() => setShowAttachments(true)}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t("rentalDetail.showAttachments")}
            </button>
          </div>
        </div>
      </div>

      {/* Attachments Modal */}
      {showAttachments && (
        <>
          <div className="fixed inset-0 z-60 bg-black/30 backdrop-blur-xs" onClick={() => setShowAttachments(false)} />
          <div className="fixed z-70 top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-gray-900">{t("assignmentDetail.attachmentPreview")}</h3>
              <button type="button" onClick={() => setShowAttachments(false)} className="text-gray-400 hover:text-gray-600">
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 p-5 text-center">
              <p className="text-[12px] font-semibold text-gray-900">rental-contract.pdf</p>
              <p className="text-[11px] text-gray-400 mt-1.5">
                {t("rentalDetail.attachmentDescription")}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
