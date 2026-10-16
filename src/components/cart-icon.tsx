"use client";

/**
 * CartIcon — Client Component (reads Zustand store).
 *
 * Renders the cart icon in the header with a live item count badge.
 * Uses `useHydrated()` to suppress the count until persistence has rehydrated.
 */

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartCount } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import Link from "next/link";

export function CartIcon() {
  const count = useCartCount();
  const hydrated = useHydrated();

  return (
    <Button variant="ghost" size="icon" className="relative h-9 w-9" asChild>
      <Link href="/cart" aria-label={`Shopping cart, ${hydrated ? count : 0} items`}>
        <ShoppingCart className="h-5 w-5" />
        {hydrated && count > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold"
            aria-hidden="true"
          >
            {count > 99 ? "99+" : count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
