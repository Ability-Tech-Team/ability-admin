import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchGuidelines, fetchGuidelineStats, fetchGuidelineProjectOptions } from "@/src/services/guidelines";
import GuidelinesPageClient from "./components/GuidelinesPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GuidelinesPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const [data, stats, projectOptions] = await Promise.all([
    fetchGuidelines(),
    fetchGuidelineStats(),
    fetchGuidelineProjectOptions(),
  ]);
  const t = await getTranslations("EventsContent");
  const g = await getTranslations("EventsContent.guidelines");

  return (
    <GuidelinesPageClient
      data={data}
      stats={stats}
      labels={{
        searchPlaceholder: t("searchPlaceholder"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        addLabel: g("newGuideline"),
      }}
      statsLabels={{
        published: g("stats.published"),
        publishedSub: g("stats.publishedSub"),
        draft: g("stats.draft"),
        draftSub: g("stats.draftSub"),
        sections: g("stats.sections"),
        sectionsSub: g("stats.sectionsSub"),
      }}
      projectsLabel={t("filters.projects")}
      projectOptions={projectOptions}
    />
  );
}
