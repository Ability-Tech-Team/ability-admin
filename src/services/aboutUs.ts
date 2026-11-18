export type AboutUsContent = {
  contentEn: string;
  contentAr: string;
};

// TODO: replace with real API call
export async function fetchAboutUsContent(): Promise<AboutUsContent> {
  return {
    contentEn:
      "Ability is a premier facility management company serving residential and commercial communities across the UAE. Our mission is to provide exceptional living experiences through world-class services and innovative technology.",
    contentAr:
      "أبيليتي شركة رائدة في إدارة المرافق تخدم مجتمعات سكنية وتجارية في جميع أنحاء الإمارات العربية المتحدة.",
  };
}
