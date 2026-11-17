"use client";

import { useState, useMemo } from "react";
import type { ToolbarLabels } from "@/src/components/Toolbar";
import type { GuestInvitation } from "@/src/services/guestInvitations";
import GuestToolbarWithModal from "./GuestToolbarWithModal";
import GuestInvitationsTable from "./GuestInvitationsTable";

type Props = {
  data: GuestInvitation[];
  labels: ToolbarLabels;
};

export default function GuestInvitationsPageClient({ data, labels }: Props) {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invitationId.toLowerCase().includes(q) ||
          inv.guestName.toLowerCase().includes(q) ||
          inv.guestPhone.includes(q) ||
          inv.resident.toLowerCase().includes(q) ||
          inv.project.toLowerCase().includes(q) ||
          inv.unit.toLowerCase().includes(q),
      );
    }

    if (statusFilter.size > 0) {
      result = result.filter((inv) => statusFilter.has(inv.qrStatus));
    }

    return result;
  }, [data, search, statusFilter]);

  return (
    <>
      <GuestToolbarWithModal
        labels={labels}
        onStatusChange={setStatusFilter}
        onSearch={setSearch}
      />
      <GuestInvitationsTable data={filtered} />
    </>
  );
}
