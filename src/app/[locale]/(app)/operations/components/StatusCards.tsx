"use client";

import { useTranslations } from "next-intl";
import type { ServiceRequestStats } from "@/src/services/serviceRequests";

type StatusCardsProps = {
  stats: ServiceRequestStats;
};

const cards = [
  { key: "open", colorClass: "border-blue-200 bg-blue-50/50", textColor: "text-blue-600", labelColor: "text-blue-600" },
  { key: "inProgress", colorClass: "border-blue-200 bg-blue-50/50", textColor: "text-blue-600", labelColor: "text-blue-600" },
  { key: "critical", colorClass: "border-red-200 bg-red-50/50", textColor: "text-red-600", labelColor: "text-red-600" },
  { key: "overdueSla", colorClass: "border-orange-200 bg-orange-50/50", textColor: "text-orange-600", labelColor: "text-orange-600" },
] as const;

export default function StatusCards({ stats }: StatusCardsProps) {
  const t = useTranslations("Operations");

  const values: Record<string, number> = {
    open: stats.open,
    inProgress: stats.inProgress,
    critical: stats.critical,
    overdueSla: stats.overdueSla,
  };

  return (
    <div className="grid grid-cols-4 gap-3 px-5">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`flex items-center justify-between rounded-xl border px-4 py-3 ${card.colorClass}`}
        >
          <span className={`text-[12px] font-medium ${card.labelColor}`}>
            {t(`statusCards.${card.key}` as Parameters<typeof t>[0])}
          </span>
          <span className={`text-[18px] font-bold ${card.textColor}`}>
            {values[card.key]}
          </span>
        </div>
      ))}
    </div>
  );
}
