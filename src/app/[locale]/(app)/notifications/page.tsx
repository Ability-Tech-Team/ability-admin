import NotificationsPageClient from "./components/NotificationsPageClient";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Notifications: sending one to a project. The browser sends it through the API
 * (`useNotificationsPage`), since only the browser holds the API's `access_token` cookie.
 */
export default async function NotificationsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();

  return <NotificationsPageClient apiBaseUrl={apiBaseUrl} portalBaseUrl={portalBaseUrl} />;
}
