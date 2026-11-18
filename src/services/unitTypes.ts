export type UnitType = {
  id: string;
  nameEn: string;
  nameAr: string;
  defaultAnnualRent: number;
  currency: string;
  active: boolean;
};

// TODO: replace with real API call
export async function fetchUnitTypes(): Promise<UnitType[]> {
  return [
    { id: "1", nameEn: "Studio", nameAr: "استوديو", defaultAnnualRent: 50000, currency: "EGP", active: true },
    { id: "2", nameEn: "1BR Apartment", nameAr: "شقة غرفة نوم", defaultAnnualRent: 75000, currency: "EGP", active: true },
    { id: "3", nameEn: "2BR Apartment", nameAr: "شقة غرفتي نوم", defaultAnnualRent: 110000, currency: "EGP", active: true },
    { id: "4", nameEn: "3BR Apartment", nameAr: "شقة 3 غرف نوم", defaultAnnualRent: 160000, currency: "EGP", active: true },
    { id: "5", nameEn: "Villa 4BR", nameAr: "فيلا 4 غرف نوم", defaultAnnualRent: 280000, currency: "EGP", active: true },
    { id: "6", nameEn: "Commercial Unit", nameAr: "وحدة تجارية", defaultAnnualRent: 120000, currency: "EGP", active: false },
  ];
}
