import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import DeliveryLogsPageClient from "./components/DeliveryLogsPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Delivery logs: each sent announcement with its recipients, push results and read rate. No
 * admin route lists them, so the page shows the table empty, with "not available yet".
 */
export default async function DeliveryLogsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Notifications");

  return (
    <DeliveryLogsPageClient
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
