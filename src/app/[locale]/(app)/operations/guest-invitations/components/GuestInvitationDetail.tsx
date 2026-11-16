"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { GuestInvitation } from "@/src/services/guestInvitations";

type Props = {
  invitation: GuestInvitation;
  onClose: () => void;
};

const qrStatusDot: Record<string, string> = {
  active: "bg-emerald-400",
  scheduled: "bg-blue-400",
  expired: "bg-gray-400",
  revoked: "bg-red-400",
};

const qrStatusBadge: Record<string, string> = {
  active: "border-emerald-400/40 bg-emerald-500/20 text-emerald-300",
  scheduled: "border-blue-400/40 bg-blue-500/20 text-blue-300",
  expired: "border-gray-400/40 bg-gray-500/20 text-gray-300",
  revoked: "border-red-400/40 bg-red-500/20 text-red-300",
};

export default function GuestInvitationDetail({ invitation, onClose }: Props) {
  const t = useTranslations("Operations");
  const [qrStatus, setQrStatus] = useState(invitation.qrStatus);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
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
          <h2 className="text-[14px] font-bold text-gray-900">
            {t("guest.detailTitle")}
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Top dark card */}
          <div className="rounded-xl bg-gray-900 px-4 py-4">
            <p className="text-[10.5px] font-medium text-gray-400 mb-1">
              {t("guest.detail.invitationId")}
            </p>
            <p className="text-[16px] font-bold text-white tracking-wide">
              {invitation.invitationId}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${qrStatusBadge[qrStatus]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${qrStatusDot[qrStatus]}`} />
                <span className="text-[10.5px] font-medium">
                  {t(`guest.qrStatuses.${qrStatus}` as Parameters<typeof t>[0])}
                </span>
              </span>
              <span className="text-[10.5px] text-gray-400">
                {t(`guest.locationRules.${invitation.locationRule}` as Parameters<typeof t>[0])}
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label={t("guest.detail.guest")} value={invitation.guestName} />
            <InfoCard label={t("guest.detail.guestPhone")} value={invitation.guestPhone} />
            <InfoCard label={t("guest.detail.resident")} value={invitation.resident} />
            <InfoCard label={t("guest.detail.unit")} value={invitation.unit} />
            <InfoCard label={t("guest.detail.project")} value={invitation.project} />
            <InfoCard label={t("guest.detail.visitDate")} value={invitation.visitDate} />
            <InfoCard label={t("guest.detail.created")} value={invitation.createdAt} />
            <InfoCard label={t("guest.detail.successfulScans")} value={String(invitation.scans)} />
          </div>

          {/* Mobile QR behavior info card */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3.5">
            <p className="text-[12px] font-semibold text-blue-900 mb-1">
              {t("guest.detail.mobileQrBehavior")}
            </p>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              {t("guest.detail.mobileQrDescription")}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-start gap-2.5 pt-1">
            <button
              onClick={() => {
                setToastMessage(t("guest.detail.resentSuccess", { id: invitation.invitationId }));
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-1 text-start text-[11px] font-semibold text-white hover:bg-blue-700 active:bg-blue-800 active:shadow-sm transition-colors"
            >
              {t("guest.detail.resendInvitation")}
            </button>
            {qrStatus !== "revoked" && (
              <button
                onClick={() => {
                  setQrStatus("revoked");
                  setToastMessage(t("guest.detail.revokedSuccess"));
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="rounded-lg bg-red-600 px-4 py-1 text-[11px] font-semibold text-white hover:bg-red-700 active:bg-red-800 active:shadow-sm transition-colors"
              >
                {t("guest.detail.revoke")}
              </button>
            )}
          </div>
        </div>

        {/* Success toast */}
        {toastMessage && (
          <div className="absolute bottom-4 end-5 flex w-fit items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-1.5 text-white shadow-lg">
            <CheckIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px] font-medium">{toastMessage}</span>
          </div>
        )}
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
