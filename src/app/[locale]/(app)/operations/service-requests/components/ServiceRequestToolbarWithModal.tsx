"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Toolbar, { type ToolbarLabels } from "@/src/components/Toolbar";
import FormModal, { type FormField } from "@/src/components/FormModal";

type Props = {
  labels: ToolbarLabels;
  extraFilters?: React.ReactNode;
};

export default function ServiceRequestToolbarWithModal({ labels, extraFilters }: Props) {
  const t = useTranslations("Operations");
  const [modalOpen, setModalOpen] = useState(false);

  const fields: FormField[] = [
    { name: "issueTitle", label: t("serviceRequest.create.issueTitle"), required: true, colSpan: 2 },
    { name: "serviceType", label: t("serviceRequest.create.serviceType"), defaultValue: "Maintenance" },
    { name: "project", label: t("serviceRequest.create.project"), defaultValue: "Marina Heights" },
    { name: "unit", label: t("serviceRequest.create.unit"), required: true },
    { name: "customer", label: t("serviceRequest.create.customer") },
    { name: "dueDate", label: t("serviceRequest.create.dueDate"), required: true, type: "date" },
    { name: "dueTimeSlot", label: t("serviceRequest.create.dueTimeSlot"), required: true, defaultValue: "09:00–10:00 · Available" },
  ];

  return (
    <>
      <Toolbar
        labels={labels}
        statusOptions={[
          { value: "open", label: t("statuses.open") },
          { value: "in-progress", label: t("statuses.in-progress") },
          { value: "resolved", label: t("statuses.resolved") },
          { value: "delayed", label: t("statuses.delayed") },
        ]}
        extraFilters={extraFilters}
        onAdd={() => setModalOpen(true)}
      />
      {modalOpen && (
        <FormModal
          title={t("serviceRequest.create.title")}
          fields={fields}
          submitLabel={t("serviceRequest.create.submit")}
          cancelLabel={t("serviceRequest.create.cancel")}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
