import { Truck, ShieldCheck, RefreshCw, Headset } from "lucide-react";

const badges = [
  {
    icon: <Truck className="h-8 w-8" />,
    title: "FREE US DELIVERY",
    description: "For US customers (including Alaska and Hawaii) on orders over $200",
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: "SECURE PAYMENT",
    description: "We accept Visa, American Express, PayPal, Payoneer Mastercard and Discover",
  },
  {
    icon: <RefreshCw className="h-8 w-8" />,
    title: "1 YEAR WARRANTY",
    description: "All of our products are made with care and covered for one year",
  },
  {
    icon: <Headset className="h-8 w-8" />,
    title: "SUPPORT 24/7",
    description: "Contact us 24 hours a day, 7 days a week. Call Us: 0123-456-789",
  },
];

export function TrustBadges() {
  return (
    <section className="bg-card py-10 border-y border-border">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-3 text-primary">{badge.icon}</div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {badge.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
