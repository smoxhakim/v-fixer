import Link from "next/link";
import { getCategories } from "@/lib/api";

export async function Footer() {
  const categories = await getCategories();
  
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold">
                <span className="text-primary">e</span>Commax
              </span>
            </Link>
            <p className="text-sm opacity-70 leading-relaxed">
              Your one-stop shop for the latest tech products. Premium quality
              electronics with fast delivery and excellent support.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="flex flex-col gap-2">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Information
            </h3>
            <ul className="flex flex-col gap-2 text-sm opacity-70">
              <li><span className="hover:opacity-100 cursor-pointer transition-opacity">About Us</span></li>
              <li><span className="hover:opacity-100 cursor-pointer transition-opacity">Contact Us</span></li>
              <li><span className="hover:opacity-100 cursor-pointer transition-opacity">Terms & Conditions</span></li>
              <li><span className="hover:opacity-100 cursor-pointer transition-opacity">Returns & Exchanges</span></li>
              <li><span className="hover:opacity-100 cursor-pointer transition-opacity">Shipping & Delivery</span></li>
              <li><span className="hover:opacity-100 cursor-pointer transition-opacity">Privacy Policy</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-sm opacity-70 mb-4 leading-relaxed">
              Subscribe to get special offers, free giveaways, and new arrivals.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 rounded-l-lg bg-background/10 border border-background/20 px-3 py-2 text-sm text-background placeholder:text-background/50 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="rounded-r-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-background/10 pt-6 text-center text-xs opacity-50">
          <p>2026 eCommax. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
