"use client";

import type { AuditLogStats } from "@/src/services/auditLog";

type Props = {
  stats: AuditLogStats;
  labels: {
    actionsToday: string;
    thisWeek: string;
    activeAdminsToday: string;
    contentPublished: string;
  };
};

const cardStyles = [
  "bg-blue-50 text-blue-700 border border-blue-200",
  "bg-gray-100 text-gray-700 border border-gray-200",
  "bg-green-50/60 text-green-700 border border-green-200",
  "bg-purple-50/60 text-purple-700 border border-purple-200",
];

export default function AuditLogStatsCards({ stats, labels }: Props) {
  const cards = [
    { label: labels.actionsToday, value: stats.actionsToday },
    { label: labels.thisWeek, value: stats.thisWeek },
    { label: labels.activeAdminsToday, value: stats.activeAdminsToday },
    { label: labels.contentPublished, value: stats.contentPublished },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-5 md:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`flex items-center justify-between rounded-xl px-5 py-2 ${cardStyles[i]}`}
        >
          <p className="text-[11px] font-medium">{card.label}</p>
          <p className="text-[13px] font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
