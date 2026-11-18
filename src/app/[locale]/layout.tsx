import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLocaleDirection, routing } from "@/src/i18n/routing";
import { Toaster } from "sonner";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic"], display: "swap", variable: "--font-cairo" });

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <body className={`${inter.variable} ${cairo.variable} ${locale === "ar" ? cairo.className : inter.className}`}>
        <NextIntlClientProvider>
          {children}
          <Toaster position="bottom-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
