"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Flame,
  Truck,
  MapPin,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { getCategories } from "@/lib/api";

const trendingKeywords = ["iPhone", "MacBook Pro", "AirPods", "GoPro", "PS5"];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/category/smartphone" },
  { label: "Products", href: "/category/computer" },
  { label: "Audio", href: "/category/audio" },
  { label: "Gaming", href: "/category/game-console" },
];

export function Header() {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-2xl font-bold text-foreground">
              <span className="text-primary">e</span>Commax
            </span>
          </Link>

          {/* Shop Now button */}
          <Link
            href="/category/smartphone"
            className="hidden md:flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
          >
            <ShoppingCart className="h-4 w-4" />
            Shop Now
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link
              href="#"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              href="/admin/login"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Trending keywords */}
        <div className="mx-auto max-w-7xl px-4 pb-2 hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 text-primary" />
          <span className="font-medium">Search Trending:</span>
          {trendingKeywords.map((k) => (
            <Link
              key={k}
              href={`/category/smartphone`}
              className="hover:text-primary transition-colors"
            >
              {k}
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden md:block border-b border-border">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-6 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link
              href="/category/smartphone"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Flame className="h-3.5 w-3.5 text-red-500" />
              Hot Deals
            </Link>
            <Link
              href="#"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Truck className="h-3.5 w-3.5" />
              Track Your Order
            </Link>
            <Link
              href="#"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              Store Locator
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-card">
          <div className="px-4 py-3">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border pt-2 mt-1">
                <p className="text-xs text-muted-foreground mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
