"use client";

/**
 * Hydration guard for Zustand persisted stores.
 *
 * Uses `useSyncExternalStore` (the canonical React 18/19 pattern) to cleanly
 * distinguish between SSR/initial hydration and client-side execution without
 * triggering cascading renders or setState-in-effect warnings.
 *
 * Server snapshot: false
 * Client snapshot: true
 */

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
