"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { User } from "@/src/services/users";
import EditUserModal from "./EditUserModal";
import ToggleSwitch from "@/src/components/ToggleSwitch";

type Props = {
  data: User[];
  projectOptions: { value: string; label: string }[];
};

const roleColors: Record<string, string> = {
  "super-admin": "border-blue-200 bg-blue-50 text-blue-600",
  "fm-manager": "border-blue-200 bg-blue-50 text-blue-600",
  "cms-editor": "border-blue-200 bg-blue-50 text-blue-600",
  "operations-staff": "border-blue-200 bg-blue-50 text-blue-600",
  "finance-manager": "border-blue-200 bg-blue-50 text-blue-600",
};

export default function UsersTable({ data, projectOptions }: Props) {
  const t = useTranslations("UsersPermissions");
  const [editing, setEditing] = useState<User | null>(null);
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const u of data) map[u.id] = u.active;
    return map;
  });

  function handleToggle(id: string) {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
    {editing && <EditUserModal projectOptions={projectOptions} user={editing} onClose={() => setEditing(null)} />}
    <div className="mx-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-start">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.user")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.role")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.projectAccess")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.lastLogin")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("columns.status")}
            </th>
            <th className="px-4 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400" />
          </tr>
        </thead>
        <tbody>
          {data.map((u) => {
            const isActive = toggles[u.id] ?? u.active;
            return (
              <tr
                key={u.id}
                className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
              >
                {/* User */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${u.initialsColor}`}
                    >
                      {u.initials}
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-gray-900">{u.name}</div>
                      <div className="text-[10px] text-gray-400">{u.email}</div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${roleColors[u.role] ?? "border-gray-200 bg-gray-50 text-gray-500"}`}
                  >
                    {t(`roles.${u.role}` as Parameters<typeof t>[0])}
                  </span>
                </td>

                {/* Project Access */}
                <td className="px-4 py-3 text-[11px] text-gray-600">{u.projectAccess}</td>

                {/* Last Login */}
                <td className="px-4 py-3 text-[11px] text-gray-500">{u.lastLogin}</td>

                {/* Status toggle */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ToggleSwitch checked={isActive} onChange={() => handleToggle(u.id)} />
                    <span className={`text-[11px] font-medium ${isActive ? "text-gray-700" : "text-gray-400"}`}>
                      {isActive ? t("statuses.active") : t("statuses.inactive")}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(u)}
                      className="text-[11px] font-medium text-gray-600 hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
        <span className="text-[11px] text-gray-400">
          {t("showing", { from: 1, to: data.length, total: data.length })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] text-gray-400"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-[11px] font-medium text-white"
          >
            1
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] text-gray-400"
          >
            &rsaquo;
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
