import { getTranslations } from "next-intl/server";
import ProductAccessNotice from "@/src/components/ProductAccessNotice";
import { requireProductAccess } from "@/src/lib/access";
import AppConfigPageClient from "./components/AppConfigPageClient";
import {
  fetchAppConfig,
  fetchLanguageOptions,
  fetchDateFormatOptions,
  fetchCurrencyOptions,
  fetchTimezoneOptions,
} from "@/src/services/appConfiguration";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AppConfigurationPage({ params }: Props) {
  const { locale } = await params;
  const access = await requireProductAccess(locale);

  if (access.status !== "available") {
    return <ProductAccessNotice access={access} locale={locale} />;
  }

  const t = await getTranslations("Settings.appConfig");

  const [data, languageOptions, dateFormatOptions, currencyOptions, timezoneOptions] =
    await Promise.all([
      fetchAppConfig(),
      fetchLanguageOptions(),
      fetchDateFormatOptions(),
      fetchCurrencyOptions(),
      fetchTimezoneOptions(),
    ]);

  return (
    <AppConfigPageClient
      data={data}
      languageOptions={languageOptions}
      dateFormatOptions={dateFormatOptions}
      currencyOptions={currencyOptions}
      timezoneOptions={timezoneOptions}
      labels={{
        appIdentity: t("appIdentity"),
        appNameEn: t("appNameEn"),
        appNameAr: t("appNameAr"),
        supportEmail: t("supportEmail"),
        supportPhone: t("supportPhone"),
        langLocalization: t("langLocalization"),
        defaultLanguage: t("defaultLanguage"),
        dateFormat: t("dateFormat"),
        currency: t("currency"),
        timezone: t("timezone"),
        featureToggles: t("featureToggles"),
        maintenanceMode: t("maintenanceMode"),
        maintenanceModeDesc: t("maintenanceModeDesc"),
        guestGatePass: t("guestGatePass"),
        guestGatePassDesc: t("guestGatePassDesc"),
        serviceRatings: t("serviceRatings"),
        serviceRatingsDesc: t("serviceRatingsDesc"),
        saveConfig: t("saveConfig"),
        saved: t("saved"),
      }}
    />
  );
}
