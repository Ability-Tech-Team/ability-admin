"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { User } from "@/src/services/users";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import Toolbar from "@/src/components/Toolbar";
import FilterDropdown from "@/src/components/FilterDropdown";
import UsersTable from "./UsersTable";
import InviteUserModal from "./InviteUserModal";

type Props = {
  data: User[];
  projectOptions: { value: string; label: string }[];
  labels: ToolbarLabels;
};

export default function UsersPageClient({ data, projectOptions, labels }: Props) {
  const t = useTranslations("UsersPermissions");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Set<string>>(new Set());
  const [projectFilter, setProjectFilter] = useState<Set<string>>(new Set());
  const [showInvite, setShowInvite] = useState(false);

  const filtered = useMemo(() => {
    let result = data;
    if (roleFilter.size > 0) {
      result = result.filter((u) => roleFilter.has(u.role));
    }
    if (projectFilter.size > 0) {
      result = result.filter((u) =>
        projectFilter.has(u.projectAccess.toLowerCase().replace(/\s+/g, "-")),
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q),
      );
    }
    return result;
  }, [data, roleFilter, projectFilter, search]);

  return (
    <div className="flex flex-col gap-4">
      {showInvite && <InviteUserModal projectOptions={projectOptions} onClose={() => setShowInvite(false)} />}
      <Toolbar
        labels={labels}
        hideStatus
        onSearch={setSearch}
        onAdd={() => setShowInvite(true)}
        extraFilters={
          <>
            <FilterDropdown
              label={t("filters.roles")}
              options={[
                { value: "super-admin", label: t("roles.super-admin") },
                { value: "fm-manager", label: t("roles.fm-manager") },
                { value: "cms-editor", label: t("roles.cms-editor") },
                { value: "operations-staff", label: t("roles.operations-staff") },
                { value: "finance-manager", label: t("roles.finance-manager") },
              ]}
              onChange={setRoleFilter}
            />
            <FilterDropdown
              label={t("filters.status")}
              options={[
                { value: "active", label: t("statuses.active") },
                { value: "inactive", label: t("statuses.inactive") },
              ]}
              onChange={() => {}}
            />
            <FilterDropdown
              label={t("filters.projectAccess")}
              options={[
                { value: "all-projects", label: "All Projects" },
                ...projectOptions,
              ]}
              onChange={setProjectFilter}
            />
          </>
        }
      />
      <UsersTable data={filtered} projectOptions={projectOptions} />
    </div>
  );
}
