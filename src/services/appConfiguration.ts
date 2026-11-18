export type AppConfig = {
  appNameEn: string;
  appNameAr: string;
  supportEmail: string;
  supportPhone: string;
  language: string;
  dateFormat: string;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
  guestGatePass: boolean;
  serviceRatings: boolean;
};

export type SelectOption = {
  value: string;
  label: string;
};

// TODO: replace with real API call
export async function fetchAppConfig(): Promise<AppConfig> {
  return {
    appNameEn: "Ability Community",
    appNameAr: "مجتمع أبيليتي",
    supportEmail: "support@ability.ae",
    supportPhone: "+971 4 123 4567",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    currency: "EGP",
    timezone: "Asia/Dubai",
    maintenanceMode: false,
    guestGatePass: true,
    serviceRatings: true,
  };
}

// TODO: replace with real API call
export async function fetchLanguageOptions(): Promise<SelectOption[]> {
  return [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
  ];
}

// TODO: replace with real API call
export async function fetchDateFormatOptions(): Promise<SelectOption[]> {
  return [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  ];
}

// TODO: replace with real API call
export async function fetchCurrencyOptions(): Promise<SelectOption[]> {
  return [
    { value: "EGP", label: "EGP — Egyptian Pound" },
    { value: "AED", label: "AED — UAE Dirham" },
    { value: "SAR", label: "SAR — Saudi Riyal" },
    { value: "USD", label: "USD — US Dollar" },
    { value: "EUR", label: "EUR — Euro" },
  ];
}

// TODO: replace with real API call
export async function fetchTimezoneOptions(): Promise<SelectOption[]> {
  return [
    { value: "Asia/Dubai", label: "Asia/Dubai (UTC+4)" },
    { value: "Asia/Riyadh", label: "Asia/Riyadh (UTC+3)" },
    { value: "Africa/Cairo", label: "Africa/Cairo (UTC+2)" },
    { value: "Europe/London", label: "Europe/London (UTC+0)" },
    { value: "America/New_York", label: "America/New_York (UTC-5)" },
  ];
}
