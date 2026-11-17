"use client";

import { useState, useMemo } from "react";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import type { Notification } from "@/src/services/notifications";
import NotificationToolbarWithModal from "./NotificationToolbarWithModal";
import NotificationFilters from "./NotificationFilters";
import NotificationsTable from "./NotificationsTable";

type Props = {
  data: Notification[];
  labels: ToolbarLabels;
};

export default function NotificationsPageClient({ data, labels }: Props) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.titleEn.toLowerCase().includes(q) ||
          n.titleAr.includes(q) ||
          n.project.toLowerCase().includes(q) ||
          n.audience.toLowerCase().includes(q),
      );
    }

    if (statusFilter.size > 0) {
      result = result.filter((n) => statusFilter.has(n.status));
    }

    if (typeFilter.size > 0) {
      result = result.filter((n) => typeFilter.has(n.type));
    }

    return result;
  }, [data, search, statusFilter, typeFilter]);

  return (
    <>
      <NotificationToolbarWithModal
        labels={labels}
        onStatusChange={setStatusFilter}
        onSearch={setSearch}
        extraFilters={<NotificationFilters onTypeChange={setTypeFilter} />}
      />
      <NotificationsTable data={filtered} />
    </>
  );
}
