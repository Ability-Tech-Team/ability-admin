"use client";

import { useTranslations } from "next-intl";
import FormModal, { type FormField } from "@/src/components/FormModal";

type Props = {
  onClose: () => void;
};

export default function CreateGuestInvitationModal({ onClose }: Props) {
  const t = useTranslations("Operations");

  const fields: FormField[] = [
    { name: "guestName", label: t("guest.create.guestName"), required: true },
    { name: "guestPhone", label: t("guest.create.guestPhone"), required: true },
    { name: "residentName", label: t("guest.create.residentName"), required: true },
    { name: "project", label: t("guest.create.project"), defaultValue: "Gouna" },
    { name: "unit", label: t("guest.create.unit"), required: true },
    { name: "visitDate", label: t("guest.create.visitDate"), required: true, type: "date" },
  ];

  return (
    <FormModal
      title={t("guest.create.title")}
      fields={fields}
      submitLabel={t("guest.createInvitation")}
      cancelLabel={t("guest.create.cancel")}
      onClose={onClose}
    />
  );
}
