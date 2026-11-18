"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import FilterDropdown from "@/src/components/FilterDropdown";
import MaintenanceDepositModal from "./MaintenanceDepositModal";
import type { MaintenanceDeposit } from "@/src/services/invoices";

export function InvoiceProjectsFilter({ projectOptions, onChange }: { projectOptions: { value: string; label: string }[]; onChange?: (selected: Set<string>) => void }) {
  const t = useTranslations("Operations");

  return (
    <FilterDropdown
      label={t("filters.projects")}
      options={projectOptions}
      onChange={onChange}
    />
  );
}

export function InvoiceTypeFilter({ onChange }: { onChange?: (selected: Set<string>) => void }) {
  const t = useTranslations("Operations");

  return (
    <FilterDropdown
      label={t("filters.invoiceType")}
      options={[
        { value: "annual-rent", label: t("invoice.types.annual-rent") },
        { value: "monthly-rent", label: t("invoice.types.monthly-rent") },
        { value: "service-charge", label: t("invoice.types.service-charge") },
      ]}
      onChange={onChange}
    />
  );
}

export function MaintenanceDepositButton({ data }: { data: MaintenanceDeposit[] }) {
  const t = useTranslations("Operations");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 h-7 text-[10.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        {t("invoice.maintenanceDeposit")}
      </button>
      {modalOpen && <MaintenanceDepositModal data={data} onClose={() => setModalOpen(false)} />}
    </>
  );
}
