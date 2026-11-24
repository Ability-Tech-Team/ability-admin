import { getTranslations } from "next-intl/server";
import CustomersPageClient from "./components/CustomersPageClient";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Customers. The browser loads them from the API (`useCustomersPage`), since only the browser
 * holds the API's `access_token` cookie.
 */
export default async function CustomersPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const [t, { apiBaseUrl, portalBaseUrl, sessionProject }] = await Promise.all([
    getTranslations("MasterData"),
    readBrowserApiConfig(),
  ]);

  return (
    <CustomersPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
      sessionProject={sessionProject}
      labels={{
        searchPlaceholder: t("searchCustomers"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        export: t("export"),
        import: t("import"),
        addLabel: t("addCustomer"),
      }}
    />
  );
}
