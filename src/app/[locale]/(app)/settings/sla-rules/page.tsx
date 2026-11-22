import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import { fetchSlaRules } from "@/src/services/slaRules";
import SlaRulesPageClient from "./components/SlaRulesPageClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SlaRulesPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Settings.slaRules");
  const data = await fetchSlaRules();

  return (
    <SlaRulesPageClient
      data={data}
      labels={{
        addSlaRule: t("addSlaRule"),
        service: t("service"),
        priority: t("priority"),
        sla: t("sla"),
        escalationTo: t("escalationTo"),
        actions: t("actions"),
        edit: t("edit"),
        hrs: t("hrs"),
        serviceName: t("serviceName"),
        priorityLabel: t("priorityLabel"),
        slaHours: t("slaHours"),
        escalationLabel: t("escalationLabel"),
        save: t("save"),
        cancel: t("cancel"),
        added: t("added"),
        updated: t("updated"),
      }}
    />
  );
}
