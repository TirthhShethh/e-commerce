/**
 * Root Layout — Server Component (default in App Router).
 *
 * RSC boundary notes:
 *  - This layout renders on the server. It sets up fonts, metadata, and wraps
 *    the tree with ThemeProvider (a Client Component boundary).
 *  - The `suppressHydrationWarning` on <html> is required by next-themes: the
 *    library injects a `class` attribute via a script before React hydrates, so
 *    React would otherwise warn about a mismatch on that attribute alone.
 *  - All fonts are loaded via `next/font/google` (zero layout shift, no external
 *    runtime requests after build).
 */

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StateFlow — Smart Shopping & Order Management",
    template: "%s | StateFlow",
  },
  description:
    "StateFlow is a modern, accessible shopping dashboard built with Next.js App Router, Zustand, React Hook Form, Zod, and shadcn/ui.",
  keywords: ["shopping", "e-commerce", "Next.js", "TypeScript", "Zustand"],
  authors: [{ name: "StateFlow" }],
  openGraph: {
    title: "StateFlow",
    description: "Smart Shopping & Order Management",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning // Required by next-themes to avoid class attribute mismatch
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1" id="main-content">
            {children}
          </main>
          <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
            <p>
              © 2024 StateFlow · Demo project — no real payments processed ·{" "}
              Built with Next.js {process.env.NEXT_PUBLIC_NEXTJS_VERSION ?? "16"}, Zustand, React Hook Form &amp; shadcn/ui
            </p>
          </footer>
          {/* Accessible toast notifications */}
          <Toaster
            position="bottom-right"
            richColors
            toastOptions={{
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
