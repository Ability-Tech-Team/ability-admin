"use client";

import { useTranslations } from "next-intl";
import type { PhoneContact } from "@/src/services/phoneDirectory";

type Props = {
  data: PhoneContact[];
};

const BADGE_CLASS = "border-blue-200 bg-blue-50 text-blue-600";

export default function PhoneDirectoryGrid({ data }: Props) {
  const t = useTranslations("EventsContent.phoneDir");

  return (
    <div className="grid grid-cols-1 gap-4 px-5 lg:grid-cols-2">
      {data.map((contact) => (
        <div
          key={contact.id}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm"
        >
          {/* Phone icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-5 w-5 text-red-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
            </svg>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-gray-900">{contact.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-gray-500">{contact.phone}</span>
              <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${BADGE_CLASS}`}>
                {t(`categories.${contact.category}` as Parameters<typeof t>[0])}
              </span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{contact.project}</div>
          </div>

          {/* Edit */}
          <button
            type="button"
            className="shrink-0 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            {t("edit")}
          </button>
        </div>
      ))}
    </div>
  );
}
