"use client";

import { useState } from "react";
import { toast } from "sonner";
import ToggleSwitch from "@/src/components/ToggleSwitch";
import SelectWrapper from "@/src/components/SelectWrapper";
import type { AppConfig, SelectOption } from "@/src/services/appConfiguration";

type Props = {
  data: AppConfig;
  languageOptions: SelectOption[];
  dateFormatOptions: SelectOption[];
  currencyOptions: SelectOption[];
  timezoneOptions: SelectOption[];
  labels: {
    appIdentity: string;
    appNameEn: string;
    appNameAr: string;
    supportEmail: string;
    supportPhone: string;
    langLocalization: string;
    defaultLanguage: string;
    dateFormat: string;
    currency: string;
    timezone: string;
    featureToggles: string;
    maintenanceMode: string;
    maintenanceModeDesc: string;
    guestGatePass: string;
    guestGatePassDesc: string;
    serviceRatings: string;
    serviceRatingsDesc: string;
    saveConfig: string;
    saved: string;
  };
};

export default function AppConfigPageClient({
  data,
  languageOptions,
  dateFormatOptions,
  currencyOptions,
  timezoneOptions,
  labels,
}: Props) {
  const [appNameEn, setAppNameEn] = useState(data.appNameEn);
  const [appNameAr, setAppNameAr] = useState(data.appNameAr);
  const [supportEmail, setSupportEmail] = useState(data.supportEmail);
  const [supportPhone, setSupportPhone] = useState(data.supportPhone);

  const [language, setLanguage] = useState(data.language);
  const [dateFormat, setDateFormat] = useState(data.dateFormat);
  const [currency, setCurrency] = useState(data.currency);
  const [timezone, setTimezone] = useState(data.timezone);

  const [maintenanceMode, setMaintenanceMode] = useState(data.maintenanceMode);
  const [guestGatePass, setGuestGatePass] = useState(data.guestGatePass);
  const [serviceRatings, setServiceRatings] = useState(data.serviceRatings);

  return (
    <div className="mx-5 flex flex-col gap-6 pb-8">
      {/* App Identity */}
      <Section title={labels.appIdentity}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={labels.appNameEn}>
            <input
              type="text"
              value={appNameEn}
              onChange={(e) => setAppNameEn(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white ps-3 pe-8 text-[13px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </Field>
          <Field label={labels.appNameAr}>
            <input
              type="text"
              value={appNameAr}
              onChange={(e) => setAppNameAr(e.target.value)}
              dir="rtl"
              className="h-10 w-full rounded-lg border border-gray-200 bg-white ps-3 pe-8 text-[13px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </Field>
          <Field label={labels.supportEmail}>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white ps-3 pe-8 text-[13px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </Field>
          <Field label={labels.supportPhone}>
            <input
              type="tel"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white ps-3 pe-8 text-[13px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </Field>
        </div>
      </Section>

      {/* Feature Toggles */}
      <Section title={labels.featureToggles}>
        <div className="flex flex-col gap-3">
          <Toggle
            label={labels.maintenanceMode}
            description={labels.maintenanceModeDesc}
            checked={maintenanceMode}
            onChange={setMaintenanceMode}
          />
          <Toggle
            label={labels.guestGatePass}
            description={labels.guestGatePassDesc}
            checked={guestGatePass}
            onChange={setGuestGatePass}
          />
          <Toggle
            label={labels.serviceRatings}
            description={labels.serviceRatingsDesc}
            checked={serviceRatings}
            onChange={setServiceRatings}
          />
        </div>
      </Section>

      {/* Language & Localization */}
      <Section title={labels.langLocalization}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={labels.defaultLanguage}>
            <SelectWrapper>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white ps-3 pe-10 text-[13px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>
          <Field label={labels.dateFormat}>
            <SelectWrapper>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white ps-3 pe-10 text-[13px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              >
                {dateFormatOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>
          <Field label={labels.currency}>
            <SelectWrapper>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white ps-3 pe-10 text-[13px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              >
                {currencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>
          <Field label={labels.timezone}>
            <SelectWrapper>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white ps-3 pe-10 text-[13px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              >
                {timezoneOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>
        </div>
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => toast.success(labels.saved)}
          className="rounded-lg bg-blue-600 px-5 py-2 text-[12px] font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          {labels.saveConfig}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 pt-4 pb-2">
        <h2 className="text-[13px] font-bold text-gray-700">{title}</h2>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 px-2 py-1">
      <label className="text-[11px] font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}


function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[12px] font-semibold text-gray-900">{label}</span>
        <span className="text-[11px] text-gray-400">{description}</span>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}
