export type Article = {
  id: string;
  titleEn: string;
  titleAr: string;
  category: "facilities" | "announcement" | "maintenance";
  project: string;
  status: "published" | "draft";
  date: string;
};

// TODO: replace with real API call
export async function fetchArticles(): Promise<Article[]> {
  return [
    {
      id: "1",
      titleEn: "New Gym Equipment Installed",
      titleAr: "تركيب معدات صالة رياضية جديدة",
      category: "facilities",
      project: "Marina Heights",
      status: "published",
      date: "2024-11-25",
    },
    {
      id: "2",
      titleEn: "Community Pool Reopening December 1st",
      titleAr: "إعادة افتتاح مسبح المجتمع في 1 ديسمبر",
      category: "announcement",
      project: "All Projects",
      status: "published",
      date: "2024-11-20",
    },
    {
      id: "3",
      titleEn: "Winter Landscaping Schedule",
      titleAr: "جدول تنسيق الحدائق الشتوي",
      category: "maintenance",
      project: "Palm Residences",
      status: "draft",
      date: "2024-11-28",
    },
  ];
}
