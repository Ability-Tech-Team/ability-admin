import { getTranslations } from "next-intl/server";
import UnitsPageClient from "./components/UnitsPageClient";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Units. The browser loads them from the API (`useUnitsPage`), since only the browser holds
 * the API's `access_token` cookie.
 */
export default async function UnitsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("MasterData");
  const { apiBaseUrl, portalBaseUrl, sessionProject } = await readBrowserApiConfig();

  return (
    <UnitsPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
      sessionProject={sessionProject}
      labels={{
        searchPlaceholder: t("searchUnits"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        export: t("export"),
        import: t("import"),
        addLabel: t("addUnit"),
      }}
    />
  );
}
