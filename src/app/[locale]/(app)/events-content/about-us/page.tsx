import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import AboutUsPageClient from "./components/AboutUsPageClient";
import { fetchAboutUsContent } from "@/src/services/aboutUs";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutUsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("EventsContent.aboutUs");
  const data = await fetchAboutUsContent();

  return (
    <AboutUsPageClient
      data={data}
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
