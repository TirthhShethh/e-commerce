/**
 * PART C — Order form schema shared between client (React Hook Form) and
 * server (Server Action).
 *
 * Keeping the schema in one place ensures the same validation rules apply on
 * both sides — no drift between client-side UX and server-side enforcement.
 */

import { z } from "zod";

export const orderFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "First name contains invalid characters"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name contains invalid characters"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email is too long"),

  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address is too long"),

  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City name is too long"),

  state: z
    .string()
    .min(2, "State/province must be at least 2 characters")
    .max(100, "State name is too long"),

  postalCode: z
    .string()
    .regex(/^[A-Z0-9\s\-]{3,10}$/i, "Please enter a valid postal code"),

  country: z.enum(
    ["US", "CA", "GB", "AU", "DE", "FR", "IN", "JP", "other"],
    { required_error: "Please select a country" }
  ),

  paymentMethod: z.enum(["card", "paypal", "cod"], {
    required_error: "Please select a payment method",
  }),

  cardNumber: z
    .string()
    .regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, "Card number must be 16 digits")
    .optional()
    .or(z.literal("")),

  agreeToTerms: z.boolean().refine((v) => v === true, {
    message: "You must agree to the terms and conditions",
  }),
});

// Conditional validation: cardNumber required only when paymentMethod === "card"
export const orderFormSchemaRefined = orderFormSchema.superRefine((data, ctx) => {
  if (data.paymentMethod === "card") {
    if (!data.cardNumber || data.cardNumber.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cardNumber"],
        message: "Card number is required when paying by card",
      });
    }
  }
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
