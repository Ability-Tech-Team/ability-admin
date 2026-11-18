"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Rental } from "@/src/services/rentals";
import DetailPanel from "@/src/components/DetailPanel";
import CloseButton from "@/src/components/CloseButton";

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
    <DetailPanel
      title={`${t("rentalDetail.tenantsOn")} ${rental.project} – ${rental.unit}`}
      onClose={onClose}
    >
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

      {/* Attachments Modal */}
      {showAttachments && (
        <>
          <div className="fixed inset-0 z-60 bg-black/30 backdrop-blur-xs" onClick={() => setShowAttachments(false)} />
          <div className="fixed z-70 top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-gray-900">{t("assignmentDetail.attachmentPreview")}</h3>
              <CloseButton onClick={() => setShowAttachments(false)} />
            </div>
            <div className="rounded-lg border border-gray-200 p-5 text-center">
              <p className="text-[12px] font-semibold text-gray-900">{rental.tenantName.toLowerCase().replace(/\s+/g, "-")}-contract.pdf</p>
              <p className="text-[11px] text-gray-400 mt-1.5">
                {t("rentalDetail.attachmentDescription")}
              </p>
            </div>
          </div>
        </>
      )}
    </DetailPanel>
  );
}
