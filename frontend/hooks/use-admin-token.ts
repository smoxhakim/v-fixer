"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "adminToken";

export function useAdminToken() {
  const [token, setTokenState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTokenState(typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null);
    setHydrated(true);
  }, []);

  const setToken = useCallback((value: string | null) => {
    setTokenState(value);
    if (typeof window === "undefined") return;
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearToken = useCallback(() => setToken(null), [setToken]);

  return { token, setToken, clearToken, hydrated };
}
