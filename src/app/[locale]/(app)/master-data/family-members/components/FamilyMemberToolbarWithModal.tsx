"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import AddFamilyMemberModal from "./AddFamilyMemberModal";

type Props = {
  labels: ToolbarLabels;
  extraFilters?: React.ReactNode;
  onStatusChange?: (selected: Set<string>) => void;
  onSearch?: (query: string) => void;
};

export default function FamilyMemberToolbarWithModal({ labels, extraFilters, onStatusChange, onSearch }: Props) {
  const t = useTranslations("MasterData");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Toolbar
        labels={labels}
        statusOptions={[
          { value: "pending", label: t("familyColumns.statuses.pending") },
          { value: "approved", label: t("familyColumns.statuses.approved") },
          { value: "rejected", label: t("familyColumns.statuses.rejected") },
        ]}
        extraFilters={extraFilters}
        onStatusChange={onStatusChange}
        onSearch={onSearch}
        onAdd={() => setModalOpen(true)}
      />
      {modalOpen && (
        <AddFamilyMemberModal onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
