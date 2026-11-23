import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";
import GuidelinesPageClient from "./components/GuidelinesPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Guidelines. The browser loads and saves them through the API (`useGuidelinesPage`), since
 * only the browser holds the API's `access_token` cookie.
 */
export default async function GuidelinesPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();
  const t = await getTranslations("EventsContent");
  const g = await getTranslations("EventsContent.guidelines");

  return (
    <GuidelinesPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
      labels={{
        searchPlaceholder: t("searchPlaceholder"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        addLabel: g("newGuideline"),
      }}
      statsLabels={{
        published: g("stats.published"),
        publishedSub: g("stats.publishedSub"),
        draft: g("stats.draft"),
        draftSub: g("stats.draftSub"),
        sections: g("stats.sections"),
        sectionsSub: g("stats.sectionsSub"),
      }}
      projectsLabel={t("filters.projects")}
    />
  );
}
