/** Storefront currency: Moroccan dirham (numeric amounts are still stored as plain numbers in the API). */
const CURRENCY_LOCALE = "fr-MA";
const CURRENCY_CODE = "MAD";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
  }).format(amount);
}

export function generateOrderNumber(): string {
  const prefix = "ORD";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
