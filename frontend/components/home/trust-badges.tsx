import { Truck, ShieldCheck, RefreshCw, Headset } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "@/lib/format";

export async function TrustBadges() {
  const t = await getTranslations("TrustBadges");
  const amount = formatCurrency(200);

  const badges = [
    {
      Icon: Truck,
      titleKey: "deliveryTitle" as const,
      descKey: "deliveryDesc" as const,
      descParams: { amount },
    },
    {
      Icon: ShieldCheck,
      titleKey: "secureTitle" as const,
      descKey: "secureDesc" as const,
      descParams: undefined as Record<string, string> | undefined,
    },
    {
      Icon: RefreshCw,
      titleKey: "warrantyTitle" as const,
      descKey: "warrantyDesc" as const,
      descParams: undefined,
    },
    {
      Icon: Headset,
      titleKey: "supportTitle" as const,
      descKey: "supportDesc" as const,
      descParams: undefined,
    },
  ];

  return (
    <section className="w-full overflow-hidden bg-background py-8 md:py-12">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="grid w-full grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {badges.map(({ Icon, titleKey, descKey, descParams }) => (
            <div
              key={titleKey}
              className="flex w-full flex-row items-center gap-3 rounded-xl border border-border bg-card p-4 md:p-5 hover:border-warning/60 transition-colors"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-foreground sm:text-xs">
                  {t(titleKey)}
                </h3>
                <p className="mt-0.5 hidden text-xs text-muted-foreground leading-relaxed md:block">
                  {descParams ? t(descKey, descParams) : t(descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
