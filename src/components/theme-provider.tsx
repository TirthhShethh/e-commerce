"use client";

/**
 * ThemeProvider — wraps the app with next-themes.
 *
 * RSC/Client boundary: this is a Client Component because next-themes
 * hooks into browser APIs (matchMedia, localStorage) and cannot run
 * on the server.
 *
 * Hydration strategy:
 *  - `attribute="class"` injects a class on <html> before React hydrates,
 *    avoiding a flash of wrong theme.
 *  - `disableTransitionOnChange` prevents CSS transitions firing during
 *    theme switch, which can cause CLS.
 *  - `enableSystem` respects the OS preference without extra JS.
 */

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
