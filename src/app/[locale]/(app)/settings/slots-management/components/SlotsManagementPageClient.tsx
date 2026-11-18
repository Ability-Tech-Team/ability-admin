"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { SlotConfig, DayColumn, TimeSlot } from "@/src/services/slotsManagement";
import SelectWrapper from "@/src/components/SelectWrapper";

type Props = {
  config: SlotConfig;
  departmentOptions: string[];
  serviceOptions: string[];
  labels: {
    slotConfig: string;
    slotConfigDesc: string;
    department: string;
    assignedService: string;
    duration: string;
    slotInterval: string;
    requiredManpower: string;
    availableEmployees: string;
    shiftStart: string;
    shiftEnd: string;
    breakStart: string;
    breakEnd: string;
    buffer: string;
    maxBookings: string;
    saveConfig: string;
    saved: string;
    availabilityCalendar: string;
    open: string;
    available: string;
    limited: string;
    fullyBooked: string;
    unavailable: string;
    selectedSlot: string;
    availableManpower: string;
    currentBookings: string;
  };
};

const statusStyles: Record<TimeSlot["status"], { card: string; dot: string }> = {
  available: { card: "border-green-200 bg-green-50 text-green-700", dot: "bg-green-500" },
  limited: { card: "border-orange-200 bg-orange-50 text-orange-700", dot: "bg-orange-500" },
  "fully-booked": { card: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
  unavailable: { card: "border-gray-200 bg-gray-50 text-gray-400", dot: "bg-gray-400" },
};

const timeRanges = [
  "08:00–09:00", "08:30–09:30", "09:00–10:00", "09:30–10:30",
  "10:00–11:00", "10:30–11:30", "11:00–12:00", "11:30–12:30",
  "12:00–13:00", "12:30–13:30", "13:00–14:00", "13:30–14:30",
  "14:00–15:00", "14:30–15:30", "15:00–16:00", "15:30–16:30",
  "16:00–17:00",
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildWeek(startDate: string): DayColumn[] {
  const d = new Date(startDate + "T00:00:00");
  const result: DayColumn[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(d);
    cur.setDate(d.getDate() + i);
    const day = cur.getDate();
    const dayName = dayNames[cur.getDay()];
    const dateStr = cur.toISOString().slice(0, 10);
    // Seed open slots from the date — deterministic pattern
    const hash = day * 7 + cur.getDay();
    const openSlots = hash % 3 === 0 ? 0 : hash % 2 === 0 ? 10 : 12;
    result.push({ date: dateStr, label: `${day} ${dayName}`, openSlots });
  }
  return result;
}

function buildSlots(openSlots: number, dateStr: string): TimeSlot[] {
  const hash = dateStr.split("-").reduce((a, b) => a + Number(b), 0);
  return timeRanges.map((time, i) => {
    let status: TimeSlot["status"];
    if (openSlots === 0) {
      // No open slots — all fully booked or unavailable during break
      status = (i >= 6 && i <= 9) || i === 16 ? "unavailable" : "fully-booked";
    } else {
      // Mix based on hash + index
      const seed = (hash + i) % 5;
      if ((i >= 6 && i <= 9) || i === 16) {
        status = "unavailable";
      } else if (seed === 0) {
        status = "limited";
      } else if (seed === 1) {
        status = "fully-booked";
      } else {
        status = "available";
      }
    }
    return { id: String(i + 1), time, status };
  });
}

export default function SlotsManagementPageClient({ config, departmentOptions, serviceOptions, labels }: Props) {
  const [cfg, setCfg] = useState(config);
  const [calendarDate, setCalendarDate] = useState("2026-11-24");

  const weekDays = useMemo(() => buildWeek(calendarDate), [calendarDate]);
  const [selectedDay, setSelectedDay] = useState(weekDays[0]?.date ?? "");

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>("2");

  // Ensure selectedDay stays valid when the calendar week changes
  const resolvedDay = weekDays.find((d) => d.date === selectedDay) ? selectedDay : (weekDays[0]?.date ?? "");
  const currentDay = weekDays.find((d) => d.date === resolvedDay) ?? weekDays[0];
  const timeSlots = useMemo(
    () => currentDay ? buildSlots(currentDay.openSlots, resolvedDay) : [],
    [currentDay, resolvedDay],
  );

  // When date picker changes, select the first day of the new week
  function handleDateChange(newDate: string) {
    setCalendarDate(newDate);
    const newWeek = buildWeek(newDate);
    setSelectedDay(newWeek[0]?.date ?? "");
  }

  function updateCfg<K extends keyof SlotConfig>(key: K, value: SlotConfig[K]) {
    setCfg((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-5 flex gap-5 pb-8">
      {/* Left: Slot Configuration */}
      <div className="w-[420px] shrink-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-[14px] font-bold text-gray-900">{labels.slotConfig}</h2>
        <p className="mb-4 text-[11px] text-gray-400">{labels.slotConfigDesc}</p>

        <div className="flex flex-col gap-3">
          <Field label={labels.department}>
            <SelectWrapper>
              <select
                value={cfg.department}
                onChange={(e) => updateCfg("department", e.target.value)}
                className={selectClass}
              >
                {departmentOptions.map((dept) => (
                  <option key={dept}>{dept}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>

          <Field label={labels.assignedService}>
            <SelectWrapper>
              <select
                value={cfg.assignedService}
                onChange={(e) => updateCfg("assignedService", e.target.value)}
                className={selectClass}
              >
                {serviceOptions.map((svc) => (
                  <option key={svc}>{svc}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={labels.duration}>
              <input
                type="number"
                value={cfg.duration}
                onChange={(e) => updateCfg("duration", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label={labels.slotInterval}>
              <input
                type="number"
                value={cfg.slotInterval}
                onChange={(e) => updateCfg("slotInterval", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={labels.requiredManpower}>
              <input
                type="number"
                value={cfg.requiredManpower}
                onChange={(e) => updateCfg("requiredManpower", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label={labels.availableEmployees}>
              <input
                type="number"
                value={cfg.availableEmployees}
                onChange={(e) => updateCfg("availableEmployees", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={labels.shiftStart}>
              <TimeInput value={cfg.shiftStart} onChange={(v) => updateCfg("shiftStart", v)} />
            </Field>
            <Field label={labels.shiftEnd}>
              <TimeInput value={cfg.shiftEnd} onChange={(v) => updateCfg("shiftEnd", v)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={labels.breakStart}>
              <TimeInput value={cfg.breakStart} onChange={(v) => updateCfg("breakStart", v)} />
            </Field>
            <Field label={labels.breakEnd}>
              <TimeInput value={cfg.breakEnd} onChange={(v) => updateCfg("breakEnd", v)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={labels.buffer}>
              <input
                type="number"
                value={cfg.buffer}
                onChange={(e) => updateCfg("buffer", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label={labels.maxBookings}>
              <input
                type="number"
                value={cfg.maxBookings}
                onChange={(e) => updateCfg("maxBookings", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={() => toast.success(labels.saved)}
            className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 text-[12px] font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {labels.saveConfig}
          </button>
        </div>
      </div>

      {/* Right: Availability Calendar */}
      <div className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-gray-900">{labels.availabilityCalendar}</h2>
            <p className="text-[11px] text-gray-400">
              {cfg.assignedService} · {cfg.department}
            </p>
          </div>
          <input
            type="date"
            value={calendarDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* Week days */}
        <div className="mb-4 mt-3 flex gap-2">
          {weekDays.map((day) => (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDay(day.date)}
              className={`flex flex-1 flex-col items-center rounded-lg border px-2 py-2 text-center transition-colors ${
                selectedDay === day.date
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-[12px] font-semibold">{day.label}</span>
              <span className={`text-[10px] ${selectedDay === day.date ? "text-blue-500" : "text-gray-400"}`}>
                {day.openSlots} {labels.open}
              </span>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mb-4 flex items-center gap-4">
          {(["available", "limited", "fully-booked", "unavailable"] as const).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${statusStyles[status].dot}`} />
              <span className="text-[11px] text-gray-500">
                {status === "available" && labels.available}
                {status === "limited" && labels.limited}
                {status === "fully-booked" && labels.fullyBooked}
                {status === "unavailable" && labels.unavailable}
              </span>
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div className="grid grid-cols-4 gap-3">
          {timeSlots.map((slot) => {
            const style = statusStyles[slot.status];
            const isSelected = selectedSlotId === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedSlotId(slot.id)}
                className={`rounded-lg border px-3 py-2.5 text-start transition-all ${style.card} ${
                  isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
                }`}
              >
                <p className="text-[12px] font-semibold">{slot.time}</p>
                <p className="text-[10px] capitalize">
                  {slot.status === "available" && labels.available}
                  {slot.status === "limited" && labels.limited}
                  {slot.status === "fully-booked" && labels.fullyBooked}
                  {slot.status === "unavailable" && labels.unavailable}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected slot info */}
        {selectedSlotId && (() => {
          const slot = timeSlots.find((s) => s.id === selectedSlotId);
          if (!slot) return null;
          const bookings = slot.status === "fully-booked" ? cfg.maxBookings : slot.status === "available" ? 0 : slot.status === "limited" ? Math.floor(cfg.maxBookings / 2) : 0;
          return (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-5 py-4">
              <div>
                <p className="text-[11px] text-gray-400">{labels.selectedSlot}</p>
                <p className="text-[14px] font-bold text-gray-900">
                  {selectedDay} · {slot.time}
                </p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-[11px] text-gray-400">{labels.availableManpower}</p>
                  <p className="text-[16px] font-bold text-gray-900">{cfg.availableEmployees}</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-400">{labels.currentBookings}</p>
                  <p className="text-[16px] font-bold text-gray-900">
                    {bookings}/{cfg.maxBookings}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

const inputClass =
  "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors";

const selectClass =
  "h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white ps-3 pe-10 text-[12px] text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass + " pe-8"}
      />
      <svg
        className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    </div>
  );
}
