import { getTranslations } from "next-intl/server";
import PageHeader from "@/src/components/PageHeader";
import NotificationsTabs from "./components/NotificationsTabs";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
};

export default async function NotificationsLayout({ params, children }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl, portalBaseUrl } = await readBrowserApiConfig();
  const t = await getTranslations("Notifications");
  const tSide = await getTranslations("SideMenu");

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PageHeader
        breadcrumbs={[
          { label: tSide("adminPanel"), href: "/" },
          { label: tSide("notifications") },
        ]}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <NotificationsTabs apiBaseUrl={apiBaseUrl} portalBaseUrl={portalBaseUrl} />
      {children}
    </div>
  );
}
