"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DetailPanel from "@/src/components/DetailPanel";
import ApiFailureNotice from "@/src/components/ApiFailureNotice";
import type { ApiFailure } from "@/src/lib/apiFailure";
import type { GuestInvitation } from "../types";
import { qrStatusOf } from "../utils";

type Props = {
  /** The list's row, shown until the invitation itself loads. */
  invitation: GuestInvitation;
  detail: { data: GuestInvitation | null; failure: ApiFailure | null; reload: () => void };
  /** Revokes (`false`) or reactivates (`true`); resolves true once saved. */
  onSetActive: (active: boolean) => Promise<boolean>;
  pending: boolean;
  failure: ApiFailure | null;
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

const none = "—";

export default function GuestInvitationDetail({ invitation: row, detail, onSetActive, pending, failure, onClose }: Props) {
  const t = useTranslations("Operations");
  const tg = useTranslations("GuestInvitationsScreen");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const invitation = detail.data ?? row;
  const qrStatus = qrStatusOf(invitation.status);
  const revoked = invitation.status === "inactive";

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  async function changeActive(active: boolean) {
    if (await onSetActive(active)) {
      setToastMessage(active ? tg("reactivatedSuccess") : t("guest.detail.revokedSuccess"));
    }
  }

  const gender =
    invitation.guestGender === "male" || invitation.guestGender === "female"
      ? tg(`genders.${invitation.guestGender}`)
      : none;

  return (
    <DetailPanel title={t("guest.detailTitle")} onClose={onClose} width="w-full max-w-[480px]" closeLabel={tg("close")}>
      <div className="flex flex-col gap-5 p-5">
        {detail.failure && <ApiFailureNotice failure={detail.failure} onRetry={detail.reload} />}

        {/* Top dark card */}
        <div className="rounded-xl bg-gray-900 px-4 py-4">
          <p className="text-[10.5px] font-medium text-gray-400 mb-1">
            {t("guest.detail.invitationId")}
          </p>
          <p className="text-[16px] font-bold text-white tracking-wide">#{invitation.id}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${qrStatusBadge[qrStatus]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${qrStatusDot[qrStatus]}`} />
              <span className="text-[10.5px] font-medium">{t(`guest.qrStatuses.${qrStatus}`)}</span>
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard label={t("guest.detail.guest")} value={invitation.guestName ?? none} />
          <InfoCard label={t("guest.detail.guestPhone")} value={invitation.guestMobile} />
          <InfoCard label={tg("fields.guestEmail")} value={invitation.guestEmail ?? none} />
          <InfoCard label={tg("fields.guestGender")} value={gender} />
          <InfoCard label={t("guest.detail.resident")} value={invitation.residentName} />
          <InfoCard label={t("guest.detail.unit")} value={invitation.unitNumber} />
          <InfoCard label={t("guest.detail.project")} value={invitation.projectName ?? none} />
          <InfoCard label={t("guest.detail.created")} value={invitation.createdAt} />
          <InfoCard label={tg("fields.validFrom")} value={invitation.validFrom} />
          <InfoCard label={tg("fields.validTo")} value={invitation.validTo} />
        </div>

        {failure && <ApiFailureNotice failure={failure} />}

        {/* Action buttons */}
        <div className="flex items-start gap-2.5 pt-1">
          {/* The admin API has no route that sends an invitation again. */}
          <button
            type="button"
            disabled
            title={tg("notAvailable")}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-1 text-start text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("guest.detail.resendInvitation")}
          </button>
          {revoked ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => void changeActive(true)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {pending ? tg("saving") : tg("reactivate")}
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => void changeActive(false)}
              className="rounded-lg bg-red-600 px-4 py-1 text-[11px] font-semibold text-white hover:bg-red-700 active:bg-red-800 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {pending ? tg("saving") : t("guest.detail.revoke")}
            </button>
          )}
        </div>
      </div>

      {/* Success toast */}
      {toastMessage && (
        <div role="status" className="fixed bottom-4 end-5 z-[60] flex w-fit items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-1.5 text-white shadow-lg">
          <CheckIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="text-[11px] font-medium">{toastMessage}</span>
        </div>
      )}
    </DetailPanel>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
      <p className="text-[11px] font-semibold text-gray-400 mb-0.5">{label}</p>
      <p className="text-[12px] font-semibold text-gray-700 break-words">{value}</p>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
