import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import PageHeader from "@/src/components/PageHeader";
import { fetchAuditLog, fetchAuditLogStats, fetchAuditModuleOptions } from "@/src/services/auditLog";
import AuditLogPageClient from "./components/AuditLogPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AuditLogPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const [data, stats, moduleOptions] = await Promise.all([
    fetchAuditLog(),
    fetchAuditLogStats(),
    fetchAuditModuleOptions(),
  ]);
  const t = await getTranslations("AuditLog");
  const tSide = await getTranslations("SideMenu");

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PageHeader
        breadcrumbs={[
          { label: tSide("adminPanel"), href: "/" },
          { label: tSide("usersPermissions") },
          { label: tSide("auditLog") },
        ]}
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t("exportLog")}
          </button>
        }
      />
      <AuditLogPageClient
        data={data}
        stats={stats}
        moduleOptions={moduleOptions}
        statsLabels={{
          actionsToday: t("stats.actionsToday"),
          thisWeek: t("stats.thisWeek"),
          activeAdminsToday: t("stats.activeAdminsToday"),
          contentPublished: t("stats.contentPublished"),
        }}
        labels={{
          searchPlaceholder: t("searchPlaceholder"),
          exactSearch: t("exactSearch"),
          modules: t("filters.modules"),
          table: t("table"),
          timeline: t("timeline"),
          from: t("from"),
          to: t("to"),
        }}
      />
    </div>
  );
}
