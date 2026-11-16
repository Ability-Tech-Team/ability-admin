import { getTranslations } from "next-intl/server";
import PageHeader from "@/src/components/PageHeader";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ServiceRequestsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("ServiceRequests");
  const tSide = await getTranslations("SideMenu");

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        breadcrumbs={[
          { label: tSide("adminPanel"), href: "/" },
          { label: tSide("operations") },
          { label: t("title") },
        ]}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <div className="flex flex-1 items-center justify-center rounded-xl bg-white p-12 shadow-sm">
        <p className="text-[13px] text-gray-400">{t("comingSoon")}</p>
      </div>
    </div>
  );
}
