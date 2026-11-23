import { getTranslations } from "next-intl/server";
import GuestInvitationsPageClient from "./components/GuestInvitationsPageClient";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Guest invitations. The browser loads them from the API (`useGuestInvitationsPage`), since
 * only the browser holds the API's `access_token` cookie.
 */
export default async function GuestInvitationsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const [t, { apiBaseUrl, portalBaseUrl }] = await Promise.all([
    getTranslations("Operations"),
    readBrowserApiConfig(),
  ]);

  return (
    <GuestInvitationsPageClient
      apiBaseUrl={apiBaseUrl}
      portalBaseUrl={portalBaseUrl}
      labels={{
        searchPlaceholder: t("searchGuests"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        addLabel: t("guest.createInvitation"),
      }}
    />
  );
}
