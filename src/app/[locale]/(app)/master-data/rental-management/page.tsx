import RentalManagementPageClient from "./components/RentalManagementPageClient";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Rental Management. The browser loads reservations and walk-in requests from the API
 * (`useRentalManagementPage`), since only the browser holds the API's `access_token` cookie.
 */
export default async function RentalManagementPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();

  return <RentalManagementPageClient apiBaseUrl={apiBaseUrl} portalBaseUrl={portalBaseUrl} />;
}
