import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";
import EventsPageClient from "./components/EventsPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Events. The browser loads and saves them through the API (`useEventsPage`), since only the
 * browser holds the API's `access_token` cookie.
 */
export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();
  const t = await getTranslations("EventsContent");

  return (
    <EventsPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
      labels={{
        searchPlaceholder: t("searchPlaceholder"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        addLabel: t("newEvent"),
      }}
    />
  );
}
