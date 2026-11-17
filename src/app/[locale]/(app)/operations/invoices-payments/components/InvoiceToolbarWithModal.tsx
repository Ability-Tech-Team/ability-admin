"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import GenerateInvoiceModal from "./GenerateInvoiceModal";

type Props = {
  labels: ToolbarLabels;
  extraFilters?: React.ReactNode;
  trailingContent?: React.ReactNode;
  onStatusChange?: (selected: Set<string>) => void;
  onSearch?: (query: string) => void;
};

export default function InvoiceToolbarWithModal({ labels, extraFilters, trailingContent, onStatusChange, onSearch }: Props) {
  const t = useTranslations("Operations");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Toolbar
        labels={labels}
        statusOptions={[
          { value: "paid", label: t("invoice.statuses.paid") },
          { value: "pending", label: t("invoice.statuses.pending") },
          { value: "overdue", label: t("invoice.statuses.overdue") },
        ]}
        extraFilters={extraFilters}
        trailingContent={trailingContent}
        onStatusChange={onStatusChange}
        onSearch={onSearch}
        onAdd={() => setModalOpen(true)}
      />
      {modalOpen && <GenerateInvoiceModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
