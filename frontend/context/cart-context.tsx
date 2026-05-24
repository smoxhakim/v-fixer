"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/api";
import { assertProduct, normalizeProduct } from "@/lib/api";
import { readCartJson, writeCartJson } from "@/lib/storage-keys";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity: number }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "UPDATE_QTY"; productId: number; quantity: number }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const product = action.product;
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + action.quantity }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { product, quantity: action.quantity }],
      };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter((i) => i.product.id !== action.productId),
      };
    case "UPDATE_QTY":
      return {
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: Math.max(1, action.quantity) }
            : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    case "LOAD":
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const stored = readCartJson();
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;
      // Hydrate from localStorage. Old persisted carts may have legacy shapes
      // (string ids, snake_case keys). normalizeProduct coerces; assertProduct
      // validates. Drop entries that fail — better an empty cart than a crash.
      const items: CartItem[] = [];
      for (const raw of parsed) {
        try {
          if (raw == null || typeof raw !== "object") continue;
          const r = raw as Record<string, unknown>;
          const product = normalizeProduct(r.product);
          assertProduct(product);
          const quantity = typeof r.quantity === "number" && r.quantity > 0
            ? r.quantity
            : 1;
          items.push({ product, quantity });
        } catch (e) {
          console.warn("cart: dropping malformed persisted item", e);
        }
      }
      if (items.length > 0) dispatch({ type: "LOAD", items });
    } catch {
      // ignore — bad JSON in localStorage, start with empty cart
    }
  }, []);

  useEffect(() => {
    writeCartJson(JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (product: Product, quantity = 1) =>
    dispatch({ type: "ADD_ITEM", product, quantity });
  const removeItem = (productId: number) =>
    dispatch({ type: "REMOVE_ITEM", productId });
  const updateQty = (productId: number, quantity: number) =>
    dispatch({ type: "UPDATE_QTY", productId, quantity });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => {
    const price = i.product.discountPrice ?? i.product.price;
    return sum + price * i.quantity;
  }, 0);
  const total = subtotal;

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        itemCount,
        subtotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
