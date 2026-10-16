"use client";

/**
 * CartSummary — Client Component.
 *
 * Reads full cart state from Zustand. This component is intentionally separate
 * from ProductCard so each subscribes only to the slice it needs:
 *  - ProductCard: subscribes to per-product quantity via `useItemQuantity`
 *  - CartSummary: subscribes to all items + subtotal via `useCartItems` + `useCartSubtotal`
 *
 * Narrow selectors prevent CartSummary from re-rendering when unrelated store
 * slices change and vice versa.
 */

import { Trash2, ShoppingCart, ArrowRight, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartItems, useCartSubtotal, useCartActions } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SHIPPING_THRESHOLD = 75;
const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08; // 8%

export function CartSummary({ showCheckoutButton = true }: { showCheckoutButton?: boolean }) {
  const items = useCartItems();
  const subtotal = useCartSubtotal();
  const { removeItem, updateQuantity, clearCart } = useCartActions();
  const hydrated = useHydrated();

  if (!hydrated) {
    // Skeleton placeholder until Zustand rehydrates from localStorage
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading cart">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ShoppingCart className="h-20 w-20 mb-4 opacity-15" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-sm text-center max-w-xs mb-6">
          Looks like you haven&apos;t added anything yet. Browse our catalogue to find something you&apos;ll love.
        </p>
        <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
          <Link href="/">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + shipping + tax).toFixed(2));
  const freeShippingProgress = Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Free shipping progress */}
      {subtotal < SHIPPING_THRESHOLD && (
        <div className="rounded-lg bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 p-3">
          <p className="text-xs font-medium text-violet-700 dark:text-violet-300 mb-2">
            Add ${(SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping!
          </p>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
              role="progressbar"
              aria-valuenow={freeShippingProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Free shipping progress"
            />
          </div>
        </div>
      )}
      {shipping === 0 && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
          <p className="text-xs font-medium text-green-700 dark:text-green-300">
            🎉 You qualify for free shipping!
          </p>
        </div>
      )}

      {/* Cart items */}
      <ul className="space-y-4" aria-label="Cart items">
        {items.map((item) => (
          <li key={item.product.id} className="flex items-start gap-4">
            {/* Product image placeholder */}
            <div className="shrink-0 flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-2xl">
              {item.product.category === "Electronics" ? "⚡" : "🖥️"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.product.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">${item.product.price.toFixed(2)} each</p>

              {/* Quantity controls */}
              <div className="flex items-center gap-1 mt-2" role="group" aria-label={`Quantity for ${item.product.name}`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    item.quantity === 1
                      ? removeItem(item.product.id)
                      : updateQuantity(item.product.id, item.quantity - 1)
                  }
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Line total + remove */}
            <div className="text-right shrink-0">
              <p className="font-semibold text-sm">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 mt-1 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.product.id)}
                aria-label={`Remove ${item.product.name} from cart`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* Totals */}
      <Separator />
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium">${subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className={cn("font-medium", shipping === 0 && "text-green-600 dark:text-green-400")}>
            {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tax (8%)</dt>
          <dd className="font-medium">${tax.toFixed(2)}</dd>
        </div>
        <Separator />
        <div className="flex justify-between text-base font-bold">
          <dt>Total</dt>
          <dd className="text-lg">${total.toFixed(2)}</dd>
        </div>
      </dl>

      {/* Actions */}
      <div className="space-y-3">
        {showCheckoutButton && (
          <Button
            asChild
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 gap-2"
            size="lg"
          >
            <Link href="/checkout">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full text-muted-foreground hover:text-destructive hover:border-destructive gap-2"
          onClick={clearCart}
        >
          <Trash2 className="h-4 w-4" />
          Clear Cart
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        Secure checkout · No account required · Demo only — no real payment
      </p>
    </div>
  );
}
