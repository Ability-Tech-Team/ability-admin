import { getTranslations } from "next-intl/server";
import AppConfigPageClient from "./components/AppConfigPageClient";
import {
  fetchAppConfig,
  fetchLanguageOptions,
  fetchDateFormatOptions,
  fetchCurrencyOptions,
  fetchTimezoneOptions,
} from "@/src/services/appConfiguration";

export default async function AppConfigurationPage() {
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
