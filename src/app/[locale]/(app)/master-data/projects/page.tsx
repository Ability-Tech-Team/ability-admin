import { getTranslations } from "next-intl/server";
import ProjectsPageClient from "./components/ProjectsPageClient";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Projects. The browser loads and saves them through the API (`useProjectsPage`), since only
 * the browser holds the API's `access_token` cookie.
 */
export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();
  const t = await getTranslations("MasterData");

  return (
    <ProjectsPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
      labels={{
        searchPlaceholder: t("searchProjects"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        addLabel: t("addProject"),
      }}
      exportLabel={t("export")}
      importLabel={t("import")}
    />
  );
}
