"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/src/i18n/navigation";

type Tab = {
  key: string;
  href: string;
};

const tabs: Tab[] = [
  { key: "appConfiguration", href: "/settings/app-configuration" },
  { key: "departments", href: "/settings/departments" },
  { key: "serviceCatalog", href: "/settings/service-catalog" },
  { key: "slotsManagement", href: "/settings/slots-management" },
  { key: "unitTypes", href: "/settings/unit-types" },
  { key: "slaRules", href: "/settings/sla-rules" },
];

export default function SettingsTabs() {
  const t = useTranslations("Settings");
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto px-5">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition-all ${
              isActive
                ? "bg-white text-gray-900 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1)] ring-1 ring-gray-200"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t(`tabs.${tab.key}` as Parameters<typeof t>[0])}
          </Link>
        );
      })}
    </div>
  );
}
