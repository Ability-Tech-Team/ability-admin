"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import CreateNotificationModal from "./CreateNotificationModal";

type Props = {
  labels: ToolbarLabels;
  extraFilters?: React.ReactNode;
  onStatusChange?: (selected: Set<string>) => void;
  onSearch?: (query: string) => void;
};

export default function NotificationToolbarWithModal({ labels, extraFilters, onStatusChange, onSearch }: Props) {
  const t = useTranslations("Notifications");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Toolbar
        labels={labels}
        statusOptions={[
          { value: "published", label: t("statuses.published") },
          { value: "scheduled", label: t("statuses.scheduled") },
          { value: "draft", label: t("statuses.draft") },
        ]}
        extraFilters={extraFilters}
        onStatusChange={onStatusChange}
        onSearch={onSearch}
        onAdd={() => setModalOpen(true)}
      />
      {modalOpen && (
        <CreateNotificationModal onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
