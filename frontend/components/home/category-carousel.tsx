"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tablet,
  Smartphone,
  Gamepad2,
  Camera,
  Watch,
  Plane,
  Headphones,
  Monitor,
  Cable,
  Activity,
} from "lucide-react";
import { getCategories } from "@/lib/api";

const iconMap: Record<string, React.ReactNode> = {
  Tablet: <Tablet className="h-7 w-7" />,
  Smartphone: <Smartphone className="h-7 w-7" />,
  Gamepad2: <Gamepad2 className="h-7 w-7" />,
  Camera: <Camera className="h-7 w-7" />,
  Watch: <Watch className="h-7 w-7" />,
  Plane: <Plane className="h-7 w-7" />,
  Headphones: <Headphones className="h-7 w-7" />,
  Monitor: <Monitor className="h-7 w-7" />,
  Cable: <Cable className="h-7 w-7" />,
  Activity: <Activity className="h-7 w-7" />,
};

type Category = any;

export function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="bg-secondary py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative flex items-center gap-4">
          <button
            onClick={() => scroll("left")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide md:gap-6"
            style={{ scrollbarWidth: "none" }}
          >
            {categories.map((cat: Category) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-3 px-3 shrink-0"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-md text-muted-foreground group-hover:text-primary group-hover:shadow-lg transition-all">
                  {iconMap[cat.icon] ?? <Monitor className="h-7 w-7" />}
                </div>
                <span className="text-xs font-medium text-foreground text-center whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
