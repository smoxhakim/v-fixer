const STORAGE_KEY = "v-fixer-recent-search-keywords";
const MAX_KEYWORDS = 10;

const UPDATED_EVENT = "v-fixer-recent-search-updated";

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

export function readRecentSearchKeywords(): string[] {
  if (typeof window === "undefined") return [];
  return parseList(localStorage.getItem(STORAGE_KEY));
}

/** Most recent first, case-insensitive dedupe, capped length. */
export function rememberSearchKeyword(term: string): string[] {
  if (typeof window === "undefined") return [];
  const t = term.trim();
  if (!t) return readRecentSearchKeywords();

  const lower = t.toLowerCase();
  const prev = readRecentSearchKeywords().filter((k) => k.toLowerCase() !== lower);
  const next = [t, ...prev].slice(0, MAX_KEYWORDS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(UPDATED_EVENT));
  return next;
}

export function subscribeRecentSearchKeywords(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(UPDATED_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(UPDATED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
