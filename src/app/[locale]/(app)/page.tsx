import { getTranslations } from "next-intl/server";
import AccessNotice from "@/src/components/AccessNotice";
import AccountBar from "@/src/components/AccountBar";
import LocaleLinks from "@/src/components/LocaleLinks";
import { requireProductAccess } from "@/src/lib/access";
import { buildPortalHomeUrl, getPortalBaseUrl } from "@/src/lib/portal";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  // Signed-out clients are redirected to the Portal's sign-in page here.
  const access = await requireProductAccess(locale);
  const t = await getTranslations("Home");
  const tAccess = await getTranslations("Access");
  const portalBaseUrl = getPortalBaseUrl();
  const portalHomeUrl = portalBaseUrl
    ? buildPortalHomeUrl(portalBaseUrl, locale)
    : null;

  return (
    // The layout provides <main>.
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
      {access.status === "available" ? (
        <>
          <h1 className="text-3xl font-semibold">{t("title")}</h1>
          <p className="max-w-md text-gray-600">{t("description")}</p>
        </>
      ) : access.status === "denied" ? (
        <AccessNotice
          title={tAccess("notAvailable.title")}
          description={tAccess("notAvailable.description")}
        />
      ) : (
        <AccessNotice
          title={tAccess("signInUnavailable.title")}
          description={tAccess("signInUnavailable.description")}
        />
      )}
      <AccountBar
        account={access.status === "sign-in-unavailable" ? null : access.account}
        portalHomeUrl={portalHomeUrl}
      />
      <LocaleLinks />
    </div>
  );
}
