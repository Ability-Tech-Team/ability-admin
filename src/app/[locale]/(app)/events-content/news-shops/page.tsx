import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";
import NewsShopsPageClient from "./components/NewsShopsPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * News & Shops: the community news. The browser loads it through the API
 * (`useNewsShopsPage`), since only the browser holds the API's `access_token` cookie.
 */
export default async function NewsShopsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();
  const t = await getTranslations("EventsContent");

  return (
    <NewsShopsPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
      labels={{
        searchPlaceholder: t("newsShops.searchPlaceholder"),
        exactSearch: t("newsShops.exactSearch"),
        status: t("status"),
        addLabel: t("newsShops.newArticle"),
      }}
    />
  );
}
