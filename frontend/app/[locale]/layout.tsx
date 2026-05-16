import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";

import { CartProvider } from "@/context/cart-context";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { HeroUIProviderWithIntlRouter } from "@/components/heroui-provider-with-intl-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "fr" | "ar")) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <HeroUIProviderWithIntlRouter locale={locale}>
          <CartProvider>
            <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden">
              <Header />
              <main className="w-full flex-1 overflow-x-hidden">{children}</main>
              <Footer />
            </div>
          </CartProvider>
          <Toaster position="top-right" richColors closeButton />
        </HeroUIProviderWithIntlRouter>
      </ThemeProvider>
      <Analytics />
    </NextIntlClientProvider>
  );
}
