import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

import { getCategories } from "@/lib/api";
import { FooterAdminAuth } from "@/components/layout/footer-admin-auth";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const SOCIALS = [
  { Icon: Facebook, href: "#", label: "Facebook" },
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Twitter, href: "#", label: "Twitter" },
  { Icon: Youtube, href: "#", label: "YouTube" },
];

export async function Footer() {
  const t = await getTranslations("Footer");
  const categories = await getCategories();

  return (
    <footer className="bg-card border-t border-border text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-black tracking-tight">
                <span className="text-primary">V-</span>fixer
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("tagline")}
            </p>

            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">
                {t("adminHeading")}
              </h3>
              <FooterAdminAuth />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-4">
              {t("categories")}
            </h3>
            <ul className="flex flex-col gap-2">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-foreground/80 hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-4">
              {t("information")}
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-foreground/80">
              <li className="cursor-pointer hover:text-primary transition-colors">
                {t("about")}
              </li>
              <li className="cursor-pointer hover:text-primary transition-colors">
                {t("contact")}
              </li>
              <li className="cursor-pointer hover:text-primary transition-colors">
                {t("terms")}
              </li>
              <li className="cursor-pointer hover:text-primary transition-colors">
                {t("returns")}
              </li>
              <li className="cursor-pointer hover:text-primary transition-colors">
                {t("shipping")}
              </li>
              <li className="cursor-pointer hover:text-primary transition-colors">
                {t("privacy")}
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-4">
              {t("newsletter")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {t("newsletterHint")}
            </p>
            <NewsletterForm
              placeholder={t("emailPlaceholder")}
              cta={t("subscribe")}
            />
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
