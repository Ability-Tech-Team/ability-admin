import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchArticles } from "@/src/services/newsShops";
import NewsShopsPageClient from "./components/NewsShopsPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewsShopsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("EventsContent");
  const articles = await fetchArticles();

  return (
    <NewsShopsPageClient
      data={articles}
      labels={{
        searchPlaceholder: t("newsShops.searchPlaceholder"),
        exactSearch: t("newsShops.exactSearch"),
        status: t("status"),
        addLabel: t("newsShops.newArticle"),
      }}
    />
  );
}
