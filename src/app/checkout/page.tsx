/**
 * Checkout Page — Server Component shell.
 *
 * RSC architecture:
 *  - This page is a Server Component; it renders static page structure.
 *  - CheckoutPageClient is a Client Component that reads Zustand cart state
 *    and passes CartItemSummary[] (serialisable plain objects) to CheckoutForm.
 *  - CheckoutForm calls the `submitOrder` Server Action on submit.
 *
 * Data flow:
 *   Server Component (layout) → Client Component (reads Zustand)
 *     → serialisable CartItemSummary[] → Server Action (re-validates with Zod)
 *
 * Suspense boundary: The checkout page shell renders instantly; the form
 * hydrates after JS loads and shows a skeleton in the meantime.
 */

import { Suspense } from "react";
import { CheckoutPageClient } from "@/components/checkout-page-client";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout — StateFlow",
  description: "Complete your order with our secure checkout process.",
};

function CheckoutSkeleton() {
  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-12">
      <div className="rounded-xl border p-6 space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </div>
            <Skeleton className="h-10 rounded-md w-full" />
          </div>
        ))}
        <Skeleton className="h-12 rounded-md w-full" />
      </div>
      <div className="rounded-xl border p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
            <Lock className="h-3 w-3" />
            Demo — no real payments
          </span>
        </div>
        <p className="text-muted-foreground mt-1">
          Complete your order with validated, secure checkout
        </p>
      </div>

      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutPageClient />
      </Suspense>
    </div>
  );
}
