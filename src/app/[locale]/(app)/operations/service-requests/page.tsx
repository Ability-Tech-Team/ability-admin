import ServiceRequestsPageClient from "./components/ServiceRequestsPageClient";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Service requests (the backend's tickets). The browser loads them from the API
 * (`useServiceRequestsPage`), since only the browser holds the API's `access_token` cookie.
 */
export default async function ServiceRequestsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();

  return <ServiceRequestsPageClient apiBaseUrl={apiBaseUrl} portalBaseUrl={portalBaseUrl} />;
}
