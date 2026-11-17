"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import AddCustomerModal from "./AddCustomerModal";

type Props = {
  labels: ToolbarLabels;
  extraFilters?: React.ReactNode;
  onStatusChange?: (selected: Set<string>) => void;
  onSearch?: (query: string) => void;
};

export default function CustomerToolbarWithModal({ labels, extraFilters, onStatusChange, onSearch }: Props) {
  const t = useTranslations("MasterData");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Toolbar
        labels={labels}
        statusOptions={[
          { value: "active", label: t("active") },
          { value: "inactive", label: t("inactive") },
        ]}
        extraFilters={extraFilters}
        onStatusChange={onStatusChange}
        onSearch={onSearch}
        onAdd={() => setModalOpen(true)}
      />
      {modalOpen && (
        <AddCustomerModal onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
