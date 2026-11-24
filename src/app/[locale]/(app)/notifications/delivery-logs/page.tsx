import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";
import DeliveryLogsPageClient from "./components/DeliveryLogsPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Delivery logs: each sent announcement with its recipients, push results and read rate. The
 * browser loads them from the API (`useDeliveryLogsPage`), since only it holds the API's
 * `access_token` cookie.
 */
export default async function DeliveryLogsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();
  const t = await getTranslations("Notifications");

  return (
    <DeliveryLogsPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
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
