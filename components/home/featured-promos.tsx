import Image from "next/image";
import Link from "next/link";

const promos = [
  {
    title: "MACBOOK PRO 16",
    subtitle: "2K Fullview Touch Display",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop",
    href: "/product/macbook-pro-16-m3-pro",
    bg: "from-sky-100 to-blue-100",
  },
  {
    title: "SMART SPEAKER",
    subtitle: "Dual-Speaker True sound",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop",
    href: "/product/sonos-era-300",
    bg: "from-pink-100 to-rose-100",
  },
  {
    title: "BAMBOO SPEAKER",
    subtitle: "Sound that Speaks for Itself",
    image:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=400&fit=crop",
    href: "/category/audio",
    bg: "from-gray-100 to-slate-100",
  },
];

export function FeaturedPromos() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {promos.map((promo) => (
            <Link
              key={promo.title}
              href={promo.href}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${promo.bg}`}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                  {promo.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {promo.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
