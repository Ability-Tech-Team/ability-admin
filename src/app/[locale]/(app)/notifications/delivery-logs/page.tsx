import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchDeliveryLogs } from "@/src/services/deliveryLogs";
import DeliveryLogsTable from "./components/DeliveryLogsTable";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DeliveryLogsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Notifications");

  const logs = await fetchDeliveryLogs();

  return (
    <DeliveryLogsTable
      data={logs}
      labels={{
        notification: t("deliveryLogs.notification"),
        sentAt: t("deliveryLogs.sentAt"),
        recipients: t("deliveryLogs.recipients"),
        delivered: t("deliveryLogs.delivered"),
        read: t("deliveryLogs.read"),
        failed: t("deliveryLogs.failed"),
        readRate: t("deliveryLogs.readRate"),
      }}
    />
  );
}
