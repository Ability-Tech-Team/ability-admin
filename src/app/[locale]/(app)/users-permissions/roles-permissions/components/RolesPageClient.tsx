"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Role, Permission } from "@/src/services/roles";
import AddRoleModal from "./AddRoleModal";

type Labels = {
  addRole: string;
  rolesTitle: string;
  permissionMatrix: string;
  usersWithRole: string;
  saveChanges: string;
  module: string;
  view: string;
  create: string;
  edit: string;
  delete: string;
  approve: string;
  permissionsSaved: string;
};

type Props = {
  roles: Role[];
  labels: Labels;
};

const permissionKeys: Permission[] = ["view", "create", "edit", "delete", "approve"];

export default function RolesPageClient({ roles, labels }: Props) {
  const [selectedId, setSelectedId] = useState(roles[0]?.id ?? "");
  const [showAddRole, setShowAddRole] = useState(false);

  // Deep-clone modules into local state so checkboxes are interactive
  const [matrixByRole, setMatrixByRole] = useState<
    Record<string, Record<string, Record<Permission, boolean>>>
  >(() => {
    const map: Record<string, Record<string, Record<Permission, boolean>>> = {};
    for (const role of roles) {
      const modules: Record<string, Record<Permission, boolean>> = {};
      for (const m of role.modules) {
        modules[m.module] = { ...m.permissions };
      }
      map[role.id] = modules;
    }
    return map;
  });

  const selectedRole = roles.find((r) => r.id === selectedId);
  const matrix = selectedRole ? matrixByRole[selectedRole.id] : undefined;

  const togglePermission = useCallback(
    (mod: string, perm: Permission) => {
      setMatrixByRole((prev) => {
        const roleMatrix = prev[selectedId];
        if (!roleMatrix) return prev;
        const modPerms = roleMatrix[mod];
        if (!modPerms) return prev;
        return {
          ...prev,
          [selectedId]: {
            ...roleMatrix,
            [mod]: { ...modPerms, [perm]: !modPerms[perm] },
          },
        };
      });
    },
    [selectedId],
  );

  const toggleAll = useCallback(() => {
    setMatrixByRole((prev) => {
      const roleMatrix = prev[selectedId];
      if (!roleMatrix) return prev;
      const allChecked = Object.values(roleMatrix).every((modPerms) =>
        permissionKeys.every((p) => modPerms[p]),
      );
      const updated: Record<string, Record<Permission, boolean>> = {};
      for (const mod of Object.keys(roleMatrix)) {
        updated[mod] = Object.fromEntries(
          permissionKeys.map((p) => [p, !allChecked]),
        ) as Record<Permission, boolean>;
      }
      return { ...prev, [selectedId]: updated };
    });
  }, [selectedId]);

  // Compute select-all state
  const allGlobalChecked =
    matrix != null &&
    Object.values(matrix).every((modPerms) =>
      permissionKeys.every((p) => modPerms[p]),
    );
  const someGlobalChecked =
    !allGlobalChecked &&
    matrix != null &&
    Object.values(matrix).some((modPerms) =>
      permissionKeys.some((p) => modPerms[p]),
    );

  const permLabels: Record<Permission, string> = {
    view: labels.view,
    create: labels.create,
    edit: labels.edit,
    delete: labels.delete,
    approve: labels.approve,
  };

  return (
    <div className="mx-5 flex gap-5">
      {showAddRole && <AddRoleModal onClose={() => setShowAddRole(false)} />}
      {/* Left sidebar — Roles list */}
      <div className="w-[220px] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-gray-900">{labels.rolesTitle}</h3>
          <button
            type="button"
            onClick={() => setShowAddRole(true)}
            className="text-[11px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
          >
            + {labels.addRole}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {roles.map((role) => {
            const isActive = role.id === selectedId;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedId(role.id)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-start transition-colors ${
                  isActive
                    ? "border-blue-200 bg-blue-50/60"
                    : "border-gray-100 bg-white hover:bg-gray-50"
                }`}
              >
                <div>
                  <div
                    className={`text-[12px] font-semibold ${isActive ? "text-blue-600" : "text-gray-800"}`}
                  >
                    {role.name}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {role.userCount} {labels.usersWithRole}
                  </div>
                </div>
                {isActive && (
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right — Permission Matrix */}
      {selectedRole && matrix && (
        <div className="flex-1 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {/* Matrix header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="text-[14px] font-bold text-gray-900">
                {selectedRole.name} — {labels.permissionMatrix}
              </h3>
              <p className="text-[11px] text-gray-400">
                {selectedRole.userCount} {labels.usersWithRole}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                toast.success(labels.permissionsSaved);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              {labels.saveChanges}
            </button>
          </div>

          {/* Matrix table */}
          <table className="w-full text-start">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allGlobalChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = someGlobalChecked;
                      }}
                      onChange={toggleAll}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {labels.module}
                  </div>
                </th>
                {permissionKeys.map((perm) => (
                  <th
                    key={perm}
                    className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                  >
                    {permLabels[perm]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedRole.modules.map((mod) => {
                const perms = matrix[mod.module];
                if (!perms) return null;
                return (
                  <tr
                    key={mod.module}
                    className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors"
                  >
                    <td className="px-5 py-3 text-[12px] font-semibold text-gray-800">
                      {mod.module}
                    </td>
                    {permissionKeys.map((perm) => (
                      <td key={perm} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={perms[perm]}
                          onChange={() => togglePermission(mod.module, perm)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
