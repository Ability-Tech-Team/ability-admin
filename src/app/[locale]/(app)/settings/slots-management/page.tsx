import { getTranslations } from "next-intl/server";
import {
  fetchSlotConfig,
  fetchDepartmentOptions,
  fetchServiceOptions,
} from "@/src/services/slotsManagement";
import SlotsManagementPageClient from "./components/SlotsManagementPageClient";

export default async function SlotsManagementPage() {
  const t = await getTranslations("Settings.slotsManagement");
  const [config, departmentOptions, serviceOptions] = await Promise.all([
    fetchSlotConfig(),
    fetchDepartmentOptions(),
    fetchServiceOptions(),
  ]);

  return (
    <SlotsManagementPageClient
      config={config}
      departmentOptions={departmentOptions}
      serviceOptions={serviceOptions}
      labels={{
        slotConfig: t("slotConfig"),
        slotConfigDesc: t("slotConfigDesc"),
        department: t("department"),
        assignedService: t("assignedService"),
        duration: t("duration"),
        slotInterval: t("slotInterval"),
        requiredManpower: t("requiredManpower"),
        availableEmployees: t("availableEmployees"),
        shiftStart: t("shiftStart"),
        shiftEnd: t("shiftEnd"),
        breakStart: t("breakStart"),
        breakEnd: t("breakEnd"),
        buffer: t("buffer"),
        maxBookings: t("maxBookings"),
        saveConfig: t("saveConfig"),
        saved: t("saved"),
        availabilityCalendar: t("availabilityCalendar"),
        open: t("open"),
        available: t("available"),
        limited: t("limited"),
        fullyBooked: t("fullyBooked"),
        unavailable: t("unavailable"),
        selectedSlot: t("selectedSlot"),
        availableManpower: t("availableManpower"),
        currentBookings: t("currentBookings"),
      }}
    />
  );
}
