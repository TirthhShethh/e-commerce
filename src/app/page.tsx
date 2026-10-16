/**
 * Home Page — Server Component (default).
 *
 * This page:
 *  1. Imports the static product data (build-time, no API call needed).
 *  2. Renders a hero section and passes data down to ProductCatalogue,
 *     which is a Client Component (handles interactivity).
 *  3. React Suspense wraps the catalogue to display a loading skeleton
 *     while the Client Component hydrates.
 *
 * RSC boundary: The product array passed to ProductCatalogue is a plain
 * JSON-serialisable object — all fields are primitives (string, number,
 * boolean). No functions or class instances cross the boundary.
 */

import { Suspense } from "react";
import { PRODUCTS } from "@/lib/products";
import { ProductCatalogue } from "@/components/product-catalogue";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop — StateFlow",
  description: "Browse our curated collection of premium electronics and office products.",
};

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
          <Skeleton className="aspect-square" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <section className="mb-12 text-center" aria-labelledby="hero-heading">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
          New arrivals just landed
        </div>

        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4"
        >
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Shop Smarter
          </span>
          <br />
          <span className="text-foreground">with StateFlow</span>
        </h1>

        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover premium electronics and office essentials. Add to cart instantly,
          check out securely — all state managed client-side for instant feedback.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
            ⚡ Instant cart updates
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
            🔒 Persistent cart state
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
            🌙 Light / Dark / System themes
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
            ✅ Validated checkout
          </span>
        </div>
      </section>

      {/* Product catalogue — Server renders the product data, client handles interactivity */}
      <Suspense fallback={<ProductGridSkeleton />}>
        {/*
          ProductCatalogue is a Client Component. It receives `products` as a
          serialisable prop from this Server Component.
        */}
        <ProductCatalogue products={PRODUCTS} />
      </Suspense>
    </div>
  );
}
