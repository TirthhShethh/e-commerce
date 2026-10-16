/**
 * PART B — Zustand Cart Store with Persistence
 *
 * Design decisions:
 * - `create` + `persist` middleware stores cart items in localStorage under "stateflow-cart".
 * - Selectors are exported individually so components can subscribe to only the slice they need,
 *   preventing unnecessary re-renders (each selector returns a primitive or a stable object).
 * - Hydration mismatch prevention: components that read cart state use `useHydrated()` guard
 *   before rendering quantities / totals; until hydration, a skeleton placeholder is shown.
 * - React 19 / Next.js 16 App Router compatibility: Actions are bound via a stable static
 *   object reference to avoid `getServerSnapshot` cache invalidation warnings.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "./products";

// ── Types ──────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];

  // Mutators
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const existing = get().items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { product, quantity: 1 }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "stateflow-cart",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
    }
  )
);

// ── Narrow selectors (stable references, minimal re-renders) ───────────────

/** Returns the raw items array. Memoise heavy computations downstream. */
export const useCartItems = () => useCartStore((s) => s.items);

/** Returns item count (total units across all products). */
export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));

/** Returns the cart subtotal rounded to 2 decimal places. */
export const useCartSubtotal = () =>
  useCartStore((s) =>
    parseFloat(
      s.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0).toFixed(2)
    )
  );

/** Returns the quantity for a specific product (0 if not in cart). */
export const useItemQuantity = (productId: string) =>
  useCartStore((s) => s.items.find((i) => i.product.id === productId)?.quantity ?? 0);

// ── Stable actions (React 19 / useSyncExternalStore compliant) ─────────────

const stableCartActions = {
  addItem: (product: Product) => useCartStore.getState().addItem(product),
  removeItem: (productId: string) => useCartStore.getState().removeItem(productId),
  updateQuantity: (productId: string, quantity: number) =>
    useCartStore.getState().updateQuantity(productId, quantity),
  clearCart: () => useCartStore.getState().clearCart(),
};

/** Mutator shortcuts with stable references */
export const useCartActions = () => stableCartActions;
