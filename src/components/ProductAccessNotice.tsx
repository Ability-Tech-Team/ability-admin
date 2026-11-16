import { getTranslations } from "next-intl/server";
import AccessNotice from "@/src/components/AccessNotice";
import AccountBar from "@/src/components/AccountBar";
import LocaleLinks from "@/src/components/LocaleLinks";
import type { ProductAccess } from "@/src/lib/access";
import { buildPortalHomeUrl, getPortalBaseUrl } from "@/src/lib/portal";

type Props = {
  access: Exclude<ProductAccess, { status: "available" }>;
  locale: string;
};

/**
 * Shown instead of a page when the sign-in doesn't open this product. Every
 * page renders it itself after `requireProductAccess`, rather than relying on
 * a layout, so no page's data is fetched or shown without access.
 */
export default async function ProductAccessNotice({ access, locale }: Props) {
  const t = await getTranslations("Access");
  const portalBaseUrl = getPortalBaseUrl();
  const portalHomeUrl = portalBaseUrl
    ? buildPortalHomeUrl(portalBaseUrl, locale)
    : null;

  return (
    // The layout provides <main>.
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
      {access.status === "denied" ? (
        <AccessNotice
          title={t("notAvailable.title")}
          description={t("notAvailable.description")}
        />
      ) : (
        <AccessNotice
          title={t("signInUnavailable.title")}
          description={t("signInUnavailable.description")}
        />
      )}
      <AccountBar
        account={access.status === "denied" ? access.account : null}
        portalHomeUrl={portalHomeUrl}
      />
      <LocaleLinks />
    </div>
  );
}
