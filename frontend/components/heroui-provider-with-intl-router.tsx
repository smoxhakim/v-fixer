"use client";

import { useRouter } from "@/i18n/navigation";
import { I18nProvider, RouterProvider } from "@heroui/react";

/**
 * HeroUI v3 ships React Aria primitives directly. Wrap the app in I18nProvider
 * for RTL/locale and RouterProvider so HeroUI internal links go through
 * next-intl's router. No HeroUIProvider exists in v3.
 */
export function HeroUIProviderWithIntlRouter({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const router = useRouter();
  return (
    <I18nProvider locale={locale === "ar" ? "ar-MA" : "fr-MA"}>
      <RouterProvider navigate={(href) => router.push(href as never)}>
        {children}
      </RouterProvider>
    </I18nProvider>
  );
}
