/** Browser localStorage keys for V-fixer (migrates legacy eCommax keys once). */

const CART_KEY = "v-fixer-cart";
const CART_LEGACY = "ecommax-cart";

const LAST_ORDER_KEY = "v-fixer-last-order";
const LAST_ORDER_LEGACY = "ecommax-last-order";

export function readCartJson(): string | null {
  if (typeof window === "undefined") return null;
  const current = localStorage.getItem(CART_KEY);
  if (current != null) return current;
  const legacy = localStorage.getItem(CART_LEGACY);
  if (legacy != null) {
    localStorage.setItem(CART_KEY, legacy);
    localStorage.removeItem(CART_LEGACY);
    return legacy;
  }
  return null;
}

export function writeCartJson(json: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, json);
}

export function writeLastOrderJson(json: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_ORDER_KEY, json);
}

export function readLastOrderJson(): string | null {
  if (typeof window === "undefined") return null;
  const current = localStorage.getItem(LAST_ORDER_KEY);
  if (current != null) return current;
  const legacy = localStorage.getItem(LAST_ORDER_LEGACY);
  if (legacy != null) {
    localStorage.setItem(LAST_ORDER_KEY, legacy);
    localStorage.removeItem(LAST_ORDER_LEGACY);
    return legacy;
  }
  return null;
}
