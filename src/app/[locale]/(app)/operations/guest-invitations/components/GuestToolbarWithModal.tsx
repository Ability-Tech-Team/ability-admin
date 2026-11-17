"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import CreateGuestInvitationModal from "./CreateGuestInvitationModal";

type Props = {
  labels: ToolbarLabels;
  onStatusChange?: (selected: Set<string>) => void;
  onSearch?: (query: string) => void;
};

export default function GuestToolbarWithModal({ labels, onStatusChange, onSearch }: Props) {
  const t = useTranslations("Operations");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
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
        onAdd={() => setModalOpen(true)}
      />
      {modalOpen && <CreateGuestInvitationModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
