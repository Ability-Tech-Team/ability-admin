"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import FormModal, { type FormField } from "@/src/components/FormModal";

type Props = {
  labels: ToolbarLabels;
  extraFilters?: React.ReactNode;
};

export default function ComplaintToolbarWithModal({ labels, extraFilters }: Props) {
  const t = useTranslations("Operations");
  const [modalOpen, setModalOpen] = useState(false);

  const fields: FormField[] = [
    { name: "subject", label: t("complaint.create.subject"), required: true, colSpan: 2 },
    { name: "description", label: t("complaint.create.description"), type: "textarea", colSpan: 2, rows: 4 },
    { name: "project", label: t("complaint.create.project"), defaultValue: "Marina Heights" },
    { name: "unit", label: t("complaint.create.unit"), required: true },
    { name: "customer", label: t("complaint.create.customer") },
    { name: "priority", label: t("complaint.create.priority"), defaultValue: "Medium" },
    { name: "status", label: t("complaint.create.status"), defaultValue: "Open" },
  ];

  return (
    <>
      <Toolbar
        labels={labels}
        statusOptions={[
          { value: "open", label: t("statuses.open") },
          { value: "in-progress", label: t("statuses.in-progress") },
          { value: "resolved", label: t("statuses.resolved") },
        ]}
        extraFilters={extraFilters}
        onAdd={() => setModalOpen(true)}
      />
      {modalOpen && (
        <FormModal
          title={t("complaint.create.title")}
          fields={fields}
          submitLabel={t("complaint.create.submit")}
          cancelLabel={t("complaint.create.cancel")}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
