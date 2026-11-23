"use client";

import { useTranslations } from "next-intl";
import type { GuestInvitationCounts } from "../types";

type Props = {
  /** Null while loading or when the counts couldn't load. */
  counts: GuestInvitationCounts | null;
};

// The API counts invitations by status; it records no scans or geofence events, so only these two.
const cards = [
  { key: "activeQrPasses", count: "active", subtitleKey: "availableNow", borderColor: "border-emerald-200", iconColor: "text-emerald-500" },
  { key: "scheduledVisits", count: "upcoming", subtitleKey: "upcoming", borderColor: "border-blue-200", iconColor: "text-blue-500" },
] as const;

export default function GuestSummaryCards({ counts }: Props) {
  const t = useTranslations("Operations");

  return (
    <div className="grid grid-cols-1 gap-3 px-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`flex items-start justify-between rounded-xl border bg-white px-4 py-3 ${card.borderColor}`}
        >
          <div>
            <p className="text-[11px] text-gray-500">{t(`guest.summary.${card.key}`)}</p>
            <p className="text-[22px] font-bold text-gray-900 mt-0.5" aria-live="polite">
              {counts ? counts[card.count] : "—"}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{t(`guest.summary.${card.subtitleKey}`)}</p>
          </div>
          <QrIcon className={`h-6 w-6 mt-1 ${card.iconColor}`} />
        </div>
      ))}
    </div>
  );
}

function QrIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M3 4.875C3 3.839 3.84 3 4.875 3h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 9.375v-4.5ZM4.875 4.5a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm7.875.375c0-1.036.84-1.875 1.875-1.875h4.5C20.16 3 21 3.84 21 4.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 0 1-1.875-1.875v-4.5Zm1.875-.375a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75A.75.75 0 0 1 6 7.5v-.75Zm9.75 0A.75.75 0 0 1 16.5 6h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75ZM3 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 19.125v-4.5Zm1.875-.375a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5ZM6 16.5a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm9.75-1.5a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 0 0 .75-.75v-.75a.75.75 0 0 0-.75-.75h-.75Zm1.5 3a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75V18Zm-3 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75V18Zm4.5 1.5a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 0 0 .75-.75v-.75a.75.75 0 0 0-.75-.75h-.75Z" clipRule="evenodd" />
    </svg>
  );
}
