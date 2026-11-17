import { getTranslations } from "next-intl/server";
import ProjectsPageClient from "./components/ProjectsPageClient";
import { fetchProjects } from "@/src/services/projects";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("MasterData");
  const projects = await fetchProjects();

  return (
    <ProjectsPageClient
      data={projects}
      labels={{
        searchPlaceholder: t("searchProjects"),
        exactSearch: t("exactSearch"),
        status: t("status"),
        export: t("export"),
        import: t("import"),
        addLabel: t("addProject"),
      }}
    />
  );
}
