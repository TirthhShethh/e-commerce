/**
 * Navbar — Server Component (default).
 *
 * RSC boundary: The outer nav shell is a Server Component — it fetches no data
 * but is lightweight and SSR-friendly. The ThemeToggle and CartIcon are Client
 * Components imported here; Next.js auto-splits the bundle at the import boundary.
 *
 * Serialisable props: none — children composition pattern avoids prop drilling.
 */

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartIcon } from "@/components/cart-icon";
import { ShoppingBag } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground hover:opacity-80 transition-opacity"
          aria-label="StateFlow home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            StateFlow
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Main navigation">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/cart"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Cart
          </Link>
          <Link
            href="/checkout"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Checkout
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
