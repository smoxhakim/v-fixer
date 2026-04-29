"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { rememberSearchKeyword } from "@/lib/recent-search-keywords";

/** Records `?q=` from the URL into recent-search localStorage (e.g. bookmarked search). */
export function RecentSearchRecorder() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q")?.trim();
    if (q) rememberSearchKeyword(q);
  }, [searchParams]);

  return null;
}
