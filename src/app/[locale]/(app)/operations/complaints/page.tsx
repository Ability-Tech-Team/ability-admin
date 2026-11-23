import ComplaintsPageClient from "./components/ComplaintsPageClient";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Complaints. The browser loads them from the API (`useComplaintsPage`), since only the
 * browser holds the API's `access_token` cookie.
 */
export default async function ComplaintsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();

  return <ComplaintsPageClient apiBaseUrl={apiBaseUrl} portalBaseUrl={portalBaseUrl} />;
}
