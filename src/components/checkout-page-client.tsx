"use client";

/**
 * CheckoutCartSummary — client-side cart reader for the checkout page sidebar.
 *
 * Provides the CartItemSummary[] needed by the CheckoutForm Server Action and
 * a read-only visual order summary with totals.
 */

import { useCartItems, useCartSubtotal } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CheckoutForm } from "@/components/checkout-form";
import type { CartItemSummary } from "@/lib/actions";

const SHIPPING_THRESHOLD = 75;
const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;

export function CheckoutPageClient() {
  const items = useCartItems();
  const subtotal = useCartSubtotal();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cartItems: CartItemSummary[] = items.map((i) => ({
    productId: i.product.id,
    name: i.product.name,
    price: i.product.price,
    quantity: i.quantity,
  }));

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + shipping + tax).toFixed(2));

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
      {/* Left: Form */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <CheckoutForm cartItems={cartItems} />
      </div>

      {/* Right: Order summary */}
      <aside className="rounded-xl border bg-card p-6 shadow-sm lg:sticky lg:top-24" aria-label="Order summary">
        <h2 className="font-semibold text-base mb-4">Order Summary</h2>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items in cart</p>
        ) : (
          <>
            <ul className="space-y-3 mb-4" aria-label="Items in order">
              {items.map((item) => (
                <li key={item.product.id} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-medium truncate block">{item.product.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.quantity} × ${item.product.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="font-semibold shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className={shipping === 0 ? "text-green-600 dark:text-green-400" : ""}>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax (8%)</dt>
                <dd>${tax.toFixed(2)}</dd>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <dt>Total</dt>
                <dd>${total.toFixed(2)}</dd>
              </div>
            </dl>
          </>
        )}
      </aside>
    </div>
  );
}
