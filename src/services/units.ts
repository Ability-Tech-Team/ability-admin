export type UnitOwner = {
  name: string;
  initials: string;
  color: string;
  extra?: number;
};

export type Unit = {
  id: string;
  unitId: string;
  number: string;
  type: string;
  project: string;
  building: string;
  owner?: UnitOwner;
  contract?: "annual" | "monthly";
  active: boolean;
};

// TODO: replace with real API call
export async function fetchUnits(): Promise<Unit[]> {
  return [
    { id: "1", unitId: "U001", number: "301", type: "1BR Apartment", project: "Marina Heights", building: "Tower A · Floor 3", owner: { name: "Ahmed Al Rashidi", initials: "AA", color: "bg-emerald-500", extra: 1 }, contract: "annual", active: true },
    { id: "2", unitId: "U002", number: "502", type: "2BR Apartment", project: "Marina Heights", building: "Tower A · Floor 5", owner: { name: "Fatima Al Suwaidi", initials: "FA", color: "bg-rose-500", extra: 2 }, contract: "annual", active: true },
    { id: "3", unitId: "U003", number: "V12", type: "Villa 4BR", project: "Palm Residences", building: "Villa Block · Floor 1", active: true },
    { id: "4", unitId: "U004", number: "801", type: "3BR Apartment", project: "Corniche Gardens", building: "Block B · Floor 8", owner: { name: "Mohammed Al Zaabi", initials: "MA", color: "bg-emerald-500", extra: 1 }, contract: "monthly", active: true },
    { id: "5", unitId: "U005", number: "2201", type: "Studio", project: "Downtown Towers", building: "Tower 1 · Floor 22", active: true },
    { id: "6", unitId: "U006", number: "1204", type: "2BR Apartment", project: "Marina Heights", building: "Tower B · Floor 12", owner: { name: "Nour Al Dabbagh", initials: "NA", color: "bg-blue-500" }, contract: "annual", active: true },
  ];
}
