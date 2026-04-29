import { Truck, ShieldCheck, RefreshCw, Headset } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { formatCurrency } from "@/lib/format";

export async function TrustBadges() {
  const t = await getTranslations("TrustBadges");
  const amount = formatCurrency(200);

  const badges = [
    {
      icon: <Truck className="h-8 w-8" />,
      titleKey: "deliveryTitle" as const,
      descKey: "deliveryDesc" as const,
      descParams: { amount },
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      titleKey: "secureTitle" as const,
      descKey: "secureDesc" as const,
      descParams: undefined as Record<string, string> | undefined,
    },
    {
      icon: <RefreshCw className="h-8 w-8" />,
      titleKey: "warrantyTitle" as const,
      descKey: "warrantyDesc" as const,
      descParams: undefined,
    },
    {
      icon: <Headset className="h-8 w-8" />,
      titleKey: "supportTitle" as const,
      descKey: "supportDesc" as const,
      descParams: undefined,
    },
  ];

  return (
    <section className="bg-card py-6 border-y border-border md:py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.titleKey}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-2 text-primary md:mb-3">{badge.icon}</div>
              <h3 className="text-[10px] font-bold uppercase leading-tight tracking-wider text-foreground sm:text-xs">
                {t(badge.titleKey)}
              </h3>
              <p className="mt-1 hidden text-xs text-muted-foreground leading-relaxed md:block">
                {badge.descParams
                  ? t(badge.descKey, badge.descParams)
                  : t(badge.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
