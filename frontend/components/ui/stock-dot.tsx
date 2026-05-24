/**
 * StockDot — M2 step 6 (2026-05-24).
 *
 * Server component. Renders the canonical stock-state indicator:
 * a 6px colored dot plus an optional label. Extracted from ProductCard
 * so the same primitive can drive PDP, cart line items, search rows,
 * and admin product lists.
 *
 * Three states:
 *   stock === 0               → "out" → clay-red dot + "Rupture"
 *   0 < stock < threshold     → "low" → sand dot + "Faible stock"
 *   stock >= threshold        → "in"  → sage dot + "{count} en stock"
 *
 * The low state deliberately hides the exact count — anchor "no theatrics."
 */

import styles from "./stock-dot.module.css";

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export interface StockDotProps {
  stock: number;
  /** Render the text label after the dot. Default true. */
  showLabel?: boolean;
  /** Boundary between "low" and "in" stock. Default 5. */
  threshold?: number;
  /** Forwarded to the root wrapper — let parents add layout spacing. */
  className?: string;
}

type StockState = "in" | "low" | "out";

function stockStateOf(stock: number, threshold: number): StockState {
  if (stock <= 0) return "out";
  if (stock < threshold) return "low";
  return "in";
}

function stockLabelOf(state: StockState, stock: number): string {
  switch (state) {
    case "out": return "Rupture";
    case "low": return "Faible stock";
    case "in":  return `${stock} en stock`;
  }
}

export function StockDot({
  stock,
  showLabel = true,
  threshold = DEFAULT_LOW_STOCK_THRESHOLD,
  className,
}: StockDotProps) {
  const state = stockStateOf(stock, threshold);
  const label = stockLabelOf(state, stock);

  return (
    <span className={[styles.root, className].filter(Boolean).join(" ")}>
      <span
        className={styles.dot}
        data-state={state}
        aria-hidden
      />
      {showLabel ? <span>{label}</span> : null}
    </span>
  );
}

export default StockDot;
