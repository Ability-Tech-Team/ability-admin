"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

export default function TemplatesButton() {
  const t = useTranslations("Notifications");

  return (
    <Link
      href="/notifications/templates"
      className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 h-7 text-[10.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
    >
      {t("tabs.templates")}
    </Link>
  );
}
