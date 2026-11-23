import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";
import PhoneDirectoryPageClient from "./components/PhoneDirectoryPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * The phone directory. The browser loads it through the API (`usePhoneDirectoryPage`), since
 * only the browser holds the API's `access_token` cookie.
 */
export default async function PhoneDirectoryPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();
  const t = await getTranslations("EventsContent");

  return (
    <PhoneDirectoryPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
      labels={{
        searchPlaceholder: t("phoneDir.searchPlaceholder"),
        exactSearch: t("phoneDir.exactSearch"),
        status: t("status"),
        addLabel: t("phoneDir.addContact"),
      }}
    />
  );
}
