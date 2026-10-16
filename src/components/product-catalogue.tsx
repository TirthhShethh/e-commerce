"use client";

/**
 * ProductCatalogue — Client Component.
 *
 * Provides category filtering and product grid. The product list is passed as a
 * prop from the parent Server Component so the catalogue query happens on the
 * server (or at build time), keeping search indexing intact.
 *
 * Why client? State for the selected category filter must live in the browser.
 * An alternative is to move filter state to the URL (searchParams) for
 * SSR-friendliness — that would be the next optimization step.
 */

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Search, Package2 } from "lucide-react";
import type { Product } from "@/lib/products";
import { CATEGORIES } from "@/lib/products";
import { cn } from "@/lib/utils";

interface ProductCatalogueProps {
  products: Product[];
}

export function ProductCatalogue({ products }: ProductCatalogueProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <section aria-label="Product catalogue">
      {/* Search & filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "transition-colors"
            )}
            aria-label="Search products"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "text-xs",
                selectedCategory === cat &&
                  "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent"
              )}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4" aria-live="polite">
        {filteredProducts.length === 0
          ? "No products found"
          : `Showing ${filteredProducts.length} product${filteredProducts.length === 1 ? "" : "s"}`}
        {selectedCategory !== "All" && ` in "${selectedCategory}"`}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Empty state */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Package2 className="h-16 w-16 mb-4 opacity-20" />
          <h2 className="text-xl font-semibold mb-2">No products found</h2>
          <p className="text-sm text-center max-w-xs">
            Try adjusting your search or filter to find what you&apos;re looking for.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        /* Product grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
