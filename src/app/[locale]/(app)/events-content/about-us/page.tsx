import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";
import AboutUsPageClient from "./components/AboutUsPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * About Us: the branding overview the mobile app shows. The browser loads and saves it through
 * the API (`useAboutUsPage`), since only the browser holds the API's `access_token` cookie.
 */
export default async function AboutUsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();
  const t = await getTranslations("EventsContent.aboutUs");

  return (
    <AboutUsPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
      labels={{
        title: t("title"),
        labelEn: t("labelEn"),
        labelAr: t("labelAr"),
        savePublish: t("savePublish"),
        saved: t("saved"),
      }}
    />
  );
}
