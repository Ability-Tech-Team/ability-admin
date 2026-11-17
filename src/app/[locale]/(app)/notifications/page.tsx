import { getTranslations } from "next-intl/server";
import NotificationsPageClient from "./components/NotificationsPageClient";
import { fetchNotifications } from "@/src/services/notifications";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NotificationsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Notifications");
  const notifications = await fetchNotifications();

  return (
    <NotificationsPageClient
      data={notifications}
      labels={{
        searchPlaceholder: t("searchPlaceholder"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        addLabel: t("newNotification"),
      }}
    />
  );
}
