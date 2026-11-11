"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/src/i18n/navigation";
import { ChevronIcon, CollapseIcon } from "../components/icons";
import { menuItems } from "../services/menuItems";

type SideMenuProps = {
  notificationCount?: number;
};

export default function SideMenu({ notificationCount = 0 }: SideMenuProps) {
  const t = useTranslations("SideMenu");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  function toggleExpand(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function isActive(href: string) {
    if (href === "#") return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const parentClass = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors w-full ${
      active
        ? "bg-[#083362] text-white [&_svg]:text-[#50a2ff] [&_svg]:stroke-[#50a2ff]"
        : "text-white/60 hover:text-white [&_svg]:text-white/60 [&_svg]:stroke-white/60 hover:[&_svg]:text-white hover:[&_svg]:stroke-white"
    }`;

  const childClass =
    "flex items-center gap-2 rounded-lg py-1.5 text-[12px] font-semibold transition-colors w-full ps-10";

  return (
    <aside
      onClick={collapsed ? () => setCollapsed(false) : undefined}
      className={`relative sticky top-0 h-screen shrink-0 bg-[#062b46] text-white flex flex-col transition-[width] duration-300 overflow-hidden ${
        collapsed ? "w-[72px] cursor-pointer" : "w-[250px]"
      }`}
    >
      {/* Gradient accent border */}
      <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-rose-500" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 ps-5">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center overflow-hidden">
          <img src="/ability-logo.png" alt="Ability Tech" className="h-8 w-8 object-contain" />
        </div>
        {!collapsed && (
          <span className="text-xs font-semibold leading-tight whitespace-nowrap">
            {t("adminPanel")}
          </span>
        )}
      </div>

      {/* Nav items */}
      <div className="border-t border-white/10 mx-3" />
      <nav className="flex-1 flex flex-col gap-0.5 px-3 pt-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const expanded = expandedKeys.has(item.key);
          const Icon = item.icon;

          /* --- Parent with children (expandable) --- */
          if (hasChildren) {
            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => toggleExpand(item.key)}
                  className={parentClass(active)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-start whitespace-nowrap overflow-hidden text-ellipsis">
                        {t(item.key)}
                      </span>
                      <ChevronIcon open={expanded} />
                    </>
                  )}
                </button>

                {/* Sub-items */}
                {expanded && !collapsed && (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {item.children!.map((child) => (
                      <span key={child.key} className={`${childClass} group`} role="menuitem">
                        <child.icon className="h-3 w-3 shrink-0" />
                        <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-white/60 group-hover:text-white transition-colors">
                          {t(child.key)}
                        </span>
                        {child.badge != null && child.badge > 0 && (
                          <span className="ms-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold leading-none text-white">
                            {child.badge}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          /* --- Leaf item (link or placeholder) --- */
          const label = (
            <>
              <span className="relative">
                <Icon className="h-4 w-4 shrink-0" />
                {item.key === "notifications" && notificationCount > 0 && (
                  <span className="absolute -top-1.5 -end-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold leading-none text-white">
                    {notificationCount}
                  </span>
                )}
              </span>
              {!collapsed && (
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {t(item.key)}
                </span>
              )}
            </>
          );

          if (item.href === "#") {
            return (
              <span key={item.key} className={parentClass(active)} role="menuitem">
                {label}
              </span>
            );
          }

          return (
            <Link key={item.key} href={item.href} className={parentClass(active)}>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed((c) => !c);
        }}
        className="flex items-center gap-1.5 px-4 py-3 text-[11px] text-white/40 hover:text-white transition-colors"
      >
        <CollapseIcon collapsed={collapsed} size="small" />
        {!collapsed && (
          <span className="whitespace-nowrap">{t("collapse")}</span>
        )}
      </button>
    </aside>
  );
}
