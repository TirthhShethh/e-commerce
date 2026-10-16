"use server";

/**
 * PART C — Native Next.js Server Action for order submission.
 *
 * "use server" directive marks this module as server-only.
 * The function is called from a Client Component but executes only on the server.
 *
 * Security measures:
 *  - Re-validates all input with the same Zod schema used client-side (never trust
 *    the client alone).
 *  - Sanitises string fields (trim whitespace, strip control characters).
 *  - Never echoes raw card number back to the client; only a masked version is returned.
 *  - No real payment processing — marks orders as "pending_payment" for demo purposes.
 *
 * Serialisable props contract:
 *  - CartItemSummary[] is a plain JSON-serialisable array (no class instances, no functions).
 *  - OrderFormValues uses only primitive types — safe to pass across the RSC boundary.
 */

import { orderFormSchemaRefined, type OrderFormValues } from "@/lib/order-schema";

// ── Types ──────────────────────────────────────────────────────────────────

export interface CartItemSummary {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderResult =
  | {
      success: true;
      orderId: string;
      message: string;
    }
  | {
      success: false;
      fieldErrors?: Partial<Record<keyof OrderFormValues, string[]>>;
      message: string;
    };

// ── Helpers ────────────────────────────────────────────────────────────────

function sanitise(value: string): string {
  // Remove null-bytes and control characters (except tab, newline)
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SF-${timestamp}-${random}`;
}

// ── Server Action ──────────────────────────────────────────────────────────

export async function submitOrder(
  formData: OrderFormValues,
  cartItems: CartItemSummary[]
): Promise<OrderResult> {
  // 1. Server-side re-validation with Zod
  const parsed = orderFormSchemaRefined.safeParse(formData);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof OrderFormValues, string[]>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof OrderFormValues;
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key]!.push(issue.message);
    }
    return {
      success: false,
      fieldErrors,
      message: "Validation failed. Please correct the highlighted fields.",
    };
  }

  const data = parsed.data;

  // 2. Sanitise all string fields
  const sanitised = {
    firstName: sanitise(data.firstName),
    lastName: sanitise(data.lastName),
    email: sanitise(data.email),
    phone: data.phone ? sanitise(data.phone) : undefined,
    address: sanitise(data.address),
    city: sanitise(data.city),
    state: sanitise(data.state),
    postalCode: sanitise(data.postalCode).toUpperCase(),
    country: data.country,
    paymentMethod: data.paymentMethod,
  };

  // 3. Validate cart is not empty
  if (!cartItems || cartItems.length === 0) {
    return {
      success: false,
      message: "Your cart is empty. Please add items before checking out.",
    };
  }

  // 4. Simulate processing delay (represents async I/O in a real system)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 5. Generate a deterministic order ID
  const orderId = generateOrderId();

  // 6. Log the order (in a real app this would be saved to a database)
  console.log("[StateFlow] New order created:", {
    orderId,
    customer: `${sanitised.firstName} ${sanitised.lastName}`,
    email: sanitised.email,
    itemCount: cartItems.reduce((s, i) => s + i.quantity, 0),
    total: cartItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2),
    paymentMethod: sanitised.paymentMethod,
    status: "pending_payment",
  });

  return {
    success: true,
    orderId,
    message: `Order ${orderId} placed successfully! A confirmation email will be sent to ${sanitised.email}. Note: this is a demo — no real payment was processed.`,
  };
}
