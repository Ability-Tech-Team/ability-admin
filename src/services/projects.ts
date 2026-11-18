export type Project = {
  id: string;
  name: string;
  nameAr: string;
  location: string;
  type: "residential" | "commercial" | "mixed-use";
  units: number;
  occupancy: number;
  manager: string;
  active: boolean;
};

export async function fetchProjectFilterOptions(): Promise<{ value: string; label: string }[]> {
  const projects = await fetchProjects();
  return projects.map((p) => ({ value: p.name.toLowerCase().replace(/\s+/g, "-"), label: p.name }));
}

// TODO: replace with real API call
export async function fetchProjects(): Promise<Project[]> {
  return [
    { id: "1", name: "Marina Heights", nameAr: "مارينا هايتس", location: "Dubai Marina", type: "residential", units: 320, occupancy: 89, manager: "Faisal Al Hammadi", active: true },
    { id: "2", name: "Palm Residences", nameAr: "بالم ريزيدنسز", location: "Palm Jumeirah", type: "residential", units: 450, occupancy: 88, manager: "Layla Hassan", active: true },
    { id: "3", name: "Corniche Gardens", nameAr: "كورنيش جاردنز", location: "Abu Dhabi Corniche", type: "mixed-use", units: 180, occupancy: 90, manager: "Omar Khalid", active: true },
    { id: "4", name: "Downtown Towers", nameAr: "داونتاون تاورز", location: "Downtown Dubai", type: "commercial", units: 560, occupancy: 86, manager: "Sara Al Mazrouei", active: true },
    { id: "5", name: "Business Bay Complex", nameAr: "بزنس باي كومبلكس", location: "Business Bay", type: "commercial", units: 200, occupancy: 72, manager: "Khalid Nasser", active: false },
  ];
}
