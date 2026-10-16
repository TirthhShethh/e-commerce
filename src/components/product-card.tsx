"use client";

/**
 * ProductCard — Client Component.
 *
 * Why client? It calls useCartStore (Zustand) to dispatch addItem and reads
 * per-item quantity — both are browser-only interactions.
 *
 * RSC boundary: ProductCard receives `product` as a serialisable prop from the
 * parent Server Component. The prop is a plain JSON-compatible object — no
 * functions, no class instances.
 *
 * Optimistic UI: When "Add to Cart" is clicked, the store is updated immediately
 * (Zustand is synchronous) giving instant feedback before any server round-trip.
 */

import { useState } from "react";
import { ShoppingCart, Star, Package, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useItemQuantity, useCartActions } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const quantity = useItemQuantity(product.id);
  const { addItem, updateQuantity, removeItem } = useCartActions();
  const hydrated = useHydrated();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    addItem(product);
    // Small animation delay for tactile feedback
    await new Promise((r) => setTimeout(r, 300));
    setAdding(false);
  };

  const inCart = hydrated && quantity > 0;

  // Category emoji map for visual richness without external images
  const categoryIcons: Record<string, string> = {
    Electronics: "⚡",
    Office: "🖥️",
  };

  const badgeColors: Record<string, string> = {
    "Best Seller": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    New: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    Sale: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
    "Top Rated": "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  };

  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        "border-border/50 bg-card",
        inCart && "ring-2 ring-violet-500/40"
      )}
    >
      {/* Product image area */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
        <div className="flex h-full w-full items-center justify-center text-7xl select-none">
          {categoryIcons[product.category] ?? "📦"}
        </div>

        {/* Badge overlay */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                badgeColors[product.badge] ?? "bg-primary/10 text-primary border-primary/30"
              )}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[2px]">
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
              <Package className="h-4 w-4" />
              Out of Stock
            </span>
          </div>
        )}

        {/* In-cart indicator */}
        {inCart && (
          <div className="absolute top-3 right-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white text-xs font-bold shadow-lg">
              {quantity}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-card-foreground">
            {product.name}
          </h3>
          <span className="shrink-0 text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {product.category}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-auto">
          <div className="flex" aria-label={`Rating: ${product.rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted"
                )}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviewCount.toLocaleString()})
          </span>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between gap-2">
        <span className="text-lg font-bold text-foreground">
          ${product.price.toFixed(2)}
        </span>

        {!product.inStock ? (
          <Button size="sm" variant="outline" disabled className="text-xs">
            Unavailable
          </Button>
        ) : inCart ? (
          /* Quantity controls */
          <div className="flex items-center gap-1" role="group" aria-label={`Quantity for ${product.name}`}>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() =>
                quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, quantity - 1)
              }
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
              {quantity}
            </span>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() => updateQuantity(product.id, quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={adding}
            className={cn(
              "text-xs gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white",
              "hover:from-violet-700 hover:to-indigo-700 transition-all",
              adding && "scale-95"
            )}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {adding ? "Adding…" : "Add to Cart"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
