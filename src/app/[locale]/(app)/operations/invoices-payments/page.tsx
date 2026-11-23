import InvoicesPageClient from "./components/InvoicesPageClient";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Invoices & Payments. The browser loads the invoices from the API (`useInvoicesPage`),
 * since only the browser holds the API's `access_token` cookie.
 */
export default async function InvoicesPaymentsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();

  return <InvoicesPageClient apiBaseUrl={apiBaseUrl} portalBaseUrl={portalBaseUrl} />;
}
