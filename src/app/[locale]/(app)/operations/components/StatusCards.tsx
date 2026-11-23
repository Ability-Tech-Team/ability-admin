"use client";

import { useTranslations } from "next-intl";
import type { ServiceRequestStats } from "@/src/services/serviceRequests";

type StatusCardsProps = {
  /** Null until the counts have loaded (or when they couldn't): the cards show "—". */
  stats: ServiceRequestStats | null;
  /** True while counts for new filters load. */
  loading?: boolean;
};

const cards = [
  { key: "open", colorClass: "border-blue-200 bg-blue-50/50", textColor: "text-blue-600", labelColor: "text-blue-600" },
  { key: "inProgress", colorClass: "border-blue-200 bg-blue-50/50", textColor: "text-blue-600", labelColor: "text-blue-600" },
  { key: "critical", colorClass: "border-red-200 bg-red-50/50", textColor: "text-red-600", labelColor: "text-red-600" },
  { key: "overdueSla", colorClass: "border-orange-200 bg-orange-50/50", textColor: "text-orange-600", labelColor: "text-orange-600" },
] as const;

/** The service requests' counts, for the list's current filters (`GET /orders/tickets/stats`). */
export default function StatusCards({ stats, loading = false }: StatusCardsProps) {
  const t = useTranslations("Operations");

  return (
    <div className="grid grid-cols-2 gap-3 px-5 md:grid-cols-4" aria-busy={loading}>
      {cards.map((card) => (
        <div
          key={card.key}
          className={`flex items-center justify-between rounded-xl border px-4 py-3 ${card.colorClass}`}
        >
          <span className={`text-[12px] font-medium ${card.labelColor}`}>
            {t(`statusCards.${card.key}`)}
          </span>
          <span className={`text-[18px] font-bold ${card.textColor} ${loading ? "opacity-50" : ""}`}>
            {stats ? stats[card.key].toLocaleString("en-US") : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
