"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import AddRentalModal from "./AddRentalModal";

type Props = {
  labels: ToolbarLabels;
  leadingContent?: React.ReactNode;
  extraFilters?: React.ReactNode;
  onStatusChange?: (selected: Set<string>) => void;
  onSearch?: (query: string) => void;
};

export default function RentalToolbarWithModal({ labels, leadingContent, extraFilters, onStatusChange, onSearch }: Props) {
  const t = useTranslations("MasterData");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Toolbar
        labels={labels}
        statusOptions={[
          { value: "pending", label: t("rentalStatuses.pending") },
          { value: "approved", label: t("rentalStatuses.approved") },
        ]}
        leadingContent={leadingContent}
        extraFilters={extraFilters}
        onStatusChange={onStatusChange}
        onSearch={onSearch}
        onAdd={() => setModalOpen(true)}
      />
      {modalOpen && (
        <AddRentalModal onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
