import { getTranslations } from "next-intl/server";
import PageHeader from "@/src/components/PageHeader";
import OperationsTabs from "./components/OperationsTabs";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { readBrowserApiConfig } from "@/src/lib/apiConfig";

type Props = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
};

export default async function OperationsLayout({ params, children }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const { apiBaseUrl } = await readBrowserApiConfig();
  const t = await getTranslations("Operations");
  const tSide = await getTranslations("SideMenu");

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PageHeader
        breadcrumbs={[
          { label: tSide("adminPanel"), href: "/" },
          { label: tSide("operations") },
        ]}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <OperationsTabs apiBaseUrl={apiBaseUrl} />
      {children}
    </div>
  );
}
