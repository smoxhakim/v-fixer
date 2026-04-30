/** Shared parsing for admin product price/stock fields (mobile sheet + desktop table). */

export function parsePriceInput(raw: string): number | null {
  const n = Number(String(raw).trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function parseStockInput(raw: string): { ok: true; value: number } | { ok: false } {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false };
  const n = Number(trimmed);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return { ok: false };
  return { ok: true, value: n };
}
