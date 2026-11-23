import { getTranslations } from "next-intl/server";
import FamilyMembersPageClient from "./components/FamilyMembersPageClient";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Family members: the owners' requests to add relatives. The browser loads them from the API
 * (`useFamilyMembersPage`), since only the browser holds the API's `access_token` cookie.
 */
export default async function FamilyMembersPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const [t, { apiBaseUrl, portalBaseUrl }] = await Promise.all([
    getTranslations("MasterData"),
    readBrowserApiConfig(),
  ]);

  return (
    <FamilyMembersPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
      labels={{
        searchPlaceholder: t("searchMembers"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        export: t("export"),
        import: t("import"),
        addLabel: t("addMember"),
      }}
    />
  );
}
