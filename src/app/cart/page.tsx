/**
 * Cart Page — Server Component shell.
 *
 * The server only provides the page frame (title, layout, heading).
 * The actual cart contents are read by CartSummary (Client Component)
 * from Zustand store on the client — there is no server-side cart state.
 *
 * This is the correct pattern: cart state lives in the browser (Zustand +
 * localStorage persistence) so it can respond instantly without a server
 * round-trip. The server page component is essentially a layout container.
 *
 * Suspense boundary: wrapping CartSummary in Suspense shows a skeleton
 * until the Client Component hydrates. After hydration, Zustand rehydrates
 * from localStorage and the real cart is displayed.
 */

import { Suspense } from "react";
import { CartSummary } from "@/components/cart-summary";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart — StateFlow",
  description: "Review your cart and proceed to checkout.",
};

function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function CartPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <p className="text-muted-foreground mt-1">
          Review your items before checking out
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {/*
          CartSummary is a Client Component — it must be wrapped in Suspense
          so that the server page can pre-render without waiting for JS hydration.
          The skeleton provides a non-shifted placeholder.
        */}
        <Suspense fallback={<CartSkeleton />}>
          <CartSummary showCheckoutButton={true} />
        </Suspense>
      </div>
    </div>
  );
}
