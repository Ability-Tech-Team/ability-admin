"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AboutUsContent } from "@/src/services/aboutUs";

type Props = {
  data: AboutUsContent;
  labels: {
    title: string;
    labelEn: string;
    labelAr: string;
    savePublish: string;
    saved: string;
  };
};

export default function AboutUsPageClient({ data, labels }: Props) {
  const [contentEn, setContentEn] = useState(data.contentEn);
  const [contentAr, setContentAr] = useState(data.contentAr);

  return (
    <div className="mx-5 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-[14px] font-bold text-gray-900 mb-4">{labels.title}</h2>

      {/* English */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[11px] font-medium text-blue-600">
          {labels.labelEn}
        </label>
        <textarea
          value={contentEn}
          onChange={(e) => setContentEn(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] leading-relaxed text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
        />
      </div>

      {/* Arabic */}
      <div className="mb-5">
        <label className="mb-1.5 block text-[11px] font-medium text-blue-600">
          {labels.labelAr}
        </label>
        <textarea
          dir="rtl"
          value={contentAr}
          onChange={(e) => setContentAr(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[12px] leading-relaxed text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
        />
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            toast.success(labels.saved);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {labels.savePublish}
        </button>
      </div>
    </div>
  );
}
