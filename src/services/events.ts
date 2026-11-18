export type CommunityEvent = {
  id: string;
  nameEn: string;
  nameAr: string;
  date: string;
  venue: string;
  project: string;
  status: "published" | "draft";
  rsvpCount: number;
  rsvpLimit: number;
};

// TODO: replace with real API call
export async function fetchEvents(): Promise<CommunityEvent[]> {
  return [
    {
      id: "1",
      nameEn: "Community BBQ Night",
      nameAr: "ليلة الشواء المجتمعية",
      date: "2024-12-07 at 18:00",
      venue: "Pool Deck",
      project: "Marina Heights",
      status: "published",
      rsvpCount: 48,
      rsvpLimit: 100,
    },
    {
      id: "2",
      nameEn: "Yoga & Wellness Morning",
      nameAr: "صباح اليوغا والعافية",
      date: "2024-12-14 at 07:00",
      venue: "Gym & Lawn",
      project: "Palm Residences",
      status: "published",
      rsvpCount: 22,
      rsvpLimit: 30,
    },
    {
      id: "3",
      nameEn: "Kids Art Workshop",
      nameAr: "ورشة فن للأطفال",
      date: "2024-12-21 at 10:00",
      venue: "Community Hall",
      project: "Corniche Gardens",
      status: "draft",
      rsvpCount: 0,
      rsvpLimit: 20,
    },
  ];
}
