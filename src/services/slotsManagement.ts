export type SlotConfig = {
  department: string;
  assignedService: string;
  duration: number;
  slotInterval: number;
  requiredManpower: number;
  availableEmployees: number;
  shiftStart: string;
  shiftEnd: string;
  breakStart: string;
  breakEnd: string;
  buffer: number;
  maxBookings: number;
};

export type TimeSlot = {
  id: string;
  time: string;
  status: "available" | "limited" | "fully-booked" | "unavailable";
};

export type DayColumn = {
  date: string;
  label: string;
  openSlots: number;
};

// TODO: replace with real API call
export async function fetchSlotConfig(): Promise<SlotConfig> {
  return {
    department: "Facility Management",
    assignedService: "HVAC Maintenance",
    duration: 60,
    slotInterval: 30,
    requiredManpower: 3,
    availableEmployees: 5,
    shiftStart: "08:00 AM",
    shiftEnd: "05:00 PM",
    breakStart: "12:00 PM",
    breakEnd: "02:00 PM",
    buffer: 15,
    maxBookings: 3,
  };
}

export async function fetchWeekDays(): Promise<DayColumn[]> {
  return [
    { date: "2026-11-24", label: "24 Tue", openSlots: 0 },
    { date: "2026-11-25", label: "25 Wed", openSlots: 10 },
    { date: "2026-11-26", label: "26 Thu", openSlots: 0 },
    { date: "2026-11-27", label: "27 Fri", openSlots: 10 },
    { date: "2026-11-28", label: "28 Sat", openSlots: 0 },
    { date: "2026-11-29", label: "29 Sun", openSlots: 10 },
    { date: "2026-11-30", label: "30 Mon", openSlots: 0 },
  ];
}

// TODO: replace with real API call
export async function fetchDepartmentOptions(): Promise<string[]> {
  return ["Facility Management", "Customer Relations", "Security", "Landscaping"];
}

// TODO: replace with real API call
export async function fetchServiceOptions(): Promise<string[]> {
  return ["HVAC Maintenance", "Plumbing Repair", "Community Support"];
}

export async function fetchTimeSlots(): Promise<TimeSlot[]> {
  return [
    { id: "1", time: "08:00–09:00", status: "fully-booked" },
    { id: "2", time: "08:30–09:30", status: "fully-booked" },
    { id: "3", time: "09:00–10:00", status: "fully-booked" },
    { id: "4", time: "09:30–10:30", status: "fully-booked" },
    { id: "5", time: "10:00–11:00", status: "fully-booked" },
    { id: "6", time: "10:30–11:30", status: "fully-booked" },
    { id: "7", time: "11:00–12:00", status: "unavailable" },
    { id: "8", time: "11:30–12:30", status: "unavailable" },
    { id: "9", time: "12:00–13:00", status: "unavailable" },
    { id: "10", time: "12:30–13:30", status: "unavailable" },
    { id: "11", time: "13:00–14:00", status: "unavailable" },
    { id: "12", time: "13:30–14:30", status: "unavailable" },
    { id: "13", time: "14:00–15:00", status: "fully-booked" },
    { id: "14", time: "14:30–15:30", status: "fully-booked" },
    { id: "15", time: "15:00–16:00", status: "fully-booked" },
    { id: "16", time: "15:30–16:30", status: "fully-booked" },
    { id: "17", time: "16:00–17:00", status: "unavailable" },
  ];
}
