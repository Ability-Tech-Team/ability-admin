import { getTranslations } from "next-intl/server";
import UnitAssignmentPageClient from "./components/UnitAssignmentPageClient";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Unit assignments. The browser loads them and assigns units through the API
 * (`useUnitAssignmentPage`), since only the browser holds the API's `access_token` cookie.
 */
export default async function UnitAssignmentPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();
  const t = await getTranslations("MasterData");

  return (
    <UnitAssignmentPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
      labels={{
        searchPlaceholder: t("searchAssignments"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        addLabel: t("addAssignment"),
      }}
    />
  );
}
