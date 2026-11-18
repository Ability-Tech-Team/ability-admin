import { getTranslations } from "next-intl/server";
import { fetchSlaRules } from "@/src/services/slaRules";
import SlaRulesPageClient from "./components/SlaRulesPageClient";

export default async function SlaRulesPage() {
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
