"use client";

import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";

type Props = {
  labels: ToolbarLabels;
  onStatusChange: (selected: Set<string>) => void;
  onSearch: (query: string) => void;
  onExactSearchChange: (exact: boolean) => void;
  onAdd: () => void;
};

export default function GuestInvitationsToolbar({ labels, onStatusChange, onSearch, onExactSearchChange, onAdd }: Props) {
  const t = useTranslations("Operations");

  return (
    <Toolbar
      labels={labels}
      statusOptions={[
        { value: "active", label: t("guest.qrStatuses.active") },
        { value: "scheduled", label: t("guest.qrStatuses.scheduled") },
        { value: "expired", label: t("guest.qrStatuses.expired") },
        { value: "revoked", label: t("guest.qrStatuses.revoked") },
      ]}
      onStatusChange={onStatusChange}
      onSearch={onSearch}
      onExactSearchChange={onExactSearchChange}
      onAdd={onAdd}
    />
  );
}
