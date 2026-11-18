"use client";

import type { GuidelineStats } from "@/src/services/guidelines";

type Props = {
  stats: GuidelineStats;
  labels: {
    published: string;
    publishedSub: string;
    draft: string;
    draftSub: string;
    sections: string;
    sectionsSub: string;
  };
};

export default function GuidelineStatsCards({ stats, labels }: Props) {
  const cards = [
    { label: labels.published, value: stats.published, sub: labels.publishedSub },
    { label: labels.draft, value: stats.draft, sub: labels.draftSub },
    { label: labels.sections, value: stats.contentSections, sub: labels.sectionsSub },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-5 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
        >
          <p className="text-[11px] text-gray-500">{card.label}</p>
          <p className="text-[28px] font-bold text-gray-900 leading-tight">{card.value}</p>
          <p className="text-[10px] text-gray-400">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
