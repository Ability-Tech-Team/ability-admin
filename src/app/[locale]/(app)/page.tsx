import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import DashboardContent from "./dashboard/components/DashboardContent";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * The dashboard. The browser loads its figures from the API (`useDashboardPage`), since
 * only the browser holds the API's `access_token` cookie.
 */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  // Signed-out clients are redirected to the Portal's sign-in page here.
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();

  return <DashboardContent apiBaseUrl={apiBaseUrl} portalBaseUrl={portalBaseUrl} />;
}
