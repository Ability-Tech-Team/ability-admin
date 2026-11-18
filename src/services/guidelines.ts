export type GuidelineStats = {
  published: number;
  draft: number;
  contentSections: number;
};

export type Guideline = {
  id: string;
  titleEn: string;
  titleAr: string;
  category: "community-guide" | "resident-guide" | "facility-rules";
  project: string;
  format: "pdf" | "text";
  sections: number;
  status: "published" | "draft";
  updated: string;
};

// TODO: replace with real API call
export async function fetchGuidelineProjectOptions(): Promise<{ value: string; label: string }[]> {
  return [
    { value: "marina-heights", label: "Marina Heights" },
    { value: "all-projects", label: "All Projects" },
    { value: "gouna", label: "Gouna" },
  ];
}

// TODO: replace with real API call
export async function fetchGuidelineStats(): Promise<GuidelineStats> {
  return { published: 2, draft: 1, contentSections: 18 };
}

export async function fetchGuidelines(): Promise<Guideline[]> {
  return [
    {
      id: "1",
      titleEn: "Guideline Porto Marina",
      titleAr: "دليل بورتو مارينا",
      category: "community-guide",
      project: "Marina Heights",
      format: "pdf",
      sections: 1,
      status: "published",
      updated: "2026-10-02",
    },
    {
      id: "2",
      titleEn: "Guideline Our Community",
      titleAr: "دليل مجتمعنا",
      category: "resident-guide",
      project: "All Projects",
      format: "text",
      sections: 12,
      status: "published",
      updated: "2026-09-28",
    },
    {
      id: "3",
      titleEn: "Pool & Beach Rules",
      titleAr: "قواعد المسبح والشاطئ",
      category: "facility-rules",
      project: "Gouna",
      format: "text",
      sections: 5,
      status: "draft",
      updated: "2026-10-06",
    },
  ];
}
