"use client";

/**
 * CheckoutForm — Client Component (PART C).
 *
 * Uses React Hook Form + Zod (@hookform/resolvers/zod) for client-side
 * validation. On submit the same Zod schema is re-applied on the server
 * inside the `submitOrder` Server Action — both paths use `orderFormSchemaRefined`.
 *
 * Pending state: `useFormStatus` (or a local `isSubmitting` flag) drives the
 * loading spinner and disabled state so users cannot double-submit.
 *
 * Error feedback: Field errors from React Hook Form appear inline below each
 * input. If the server returns additional validation errors they are merged
 * via `setError`. Global status (success / error) is shown via toast.
 *
 * RSC boundary: This file is "use client". It receives `cartItems` as a
 * serialisable prop (CartItemSummary[] — plain JSON) from the Server Component
 * that wraps the checkout page.
 */

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderFormSchemaRefined, type OrderFormValues } from "@/lib/order-schema";
import { submitOrder, type CartItemSummary, type OrderResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Loader2, CreditCard, Truck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartActions } from "@/lib/cart-store";
import Link from "next/link";
import { toast } from "sonner";

interface CheckoutFormProps {
  cartItems: CartItemSummary[];
}

export function CheckoutForm({ cartItems }: CheckoutFormProps) {
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const { clearCart } = useCartActions();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchemaRefined),
    defaultValues: {
      country: "US",
      paymentMethod: "card",
      agreeToTerms: false,
    },
  });

  const paymentMethod = watch("paymentMethod");

  const onSubmit = async (data: OrderFormValues) => {
    startTransition(async () => {
      const result = await submitOrder(data, cartItems);
      setOrderResult(result);

      if (result.success) {
        clearCart();
        toast.success("Order placed!", {
          description: `Order ${result.orderId} confirmed.`,
          duration: 6000,
        });
      } else {
        // Merge server-side field errors into the form
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            setError(field as keyof OrderFormValues, {
              type: "server",
              message: messages?.[0],
            });
          }
        }
        toast.error("Order failed", {
          description: result.message,
        });
      }
    });
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (orderResult?.success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" role="status" aria-live="polite">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-muted-foreground mb-1">Order ID: <span className="font-mono font-semibold text-foreground">{orderResult.orderId}</span></p>
        <p className="text-sm text-muted-foreground max-w-md mt-4 mb-8">
          {orderResult.message}
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
            <Link href="/">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/cart">Back to Cart</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = isSubmitting || isPending;

  const fieldClass = (hasError: boolean) =>
    cn(
      "w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
      "placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:opacity-50 transition-colors",
      hasError
        ? "border-destructive focus:ring-destructive"
        : "border-input"
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Checkout form">
      <div className="space-y-8">
        {/* ── Personal Info ────────────────────────────────────────── */}
        <fieldset className="space-y-4" disabled={isLoading}>
          <legend className="text-base font-semibold flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white text-xs">1</span>
            Contact Information
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name *</Label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                aria-required="true"
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                aria-invalid={!!errors.firstName}
                {...register("firstName")}
                className={fieldClass(!!errors.firstName)}
                placeholder="Jane"
              />
              {errors.firstName && (
                <p id="firstName-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3 w-3" />
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name *</Label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                aria-required="true"
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                aria-invalid={!!errors.lastName}
                {...register("lastName")}
                className={fieldClass(!!errors.lastName)}
                placeholder="Smith"
              />
              {errors.lastName && (
                <p id="lastName-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3 w-3" />
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-required="true"
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={!!errors.email}
                {...register("email")}
                className={fieldClass(!!errors.email)}
                placeholder="jane@example.com"
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                aria-describedby={errors.phone ? "phone-error" : undefined}
                aria-invalid={!!errors.phone}
                {...register("phone")}
                className={fieldClass(!!errors.phone)}
                placeholder="+1 555 000 0000"
              />
              {errors.phone && (
                <p id="phone-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <Separator />

        {/* ── Shipping ─────────────────────────────────────────────── */}
        <fieldset className="space-y-4" disabled={isLoading}>
          <legend className="text-base font-semibold flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white text-xs">2</span>
            <Truck className="h-4 w-4" />
            Shipping Address
          </legend>

          <div className="space-y-1.5">
            <Label htmlFor="address">Street address *</Label>
            <input
              id="address"
              type="text"
              autoComplete="street-address"
              aria-required="true"
              aria-describedby={errors.address ? "address-error" : undefined}
              aria-invalid={!!errors.address}
              {...register("address")}
              className={fieldClass(!!errors.address)}
              placeholder="123 Main Street, Apt 4B"
            />
            {errors.address && (
              <p id="address-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-3 w-3" />
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="city">City *</Label>
              <input
                id="city"
                type="text"
                autoComplete="address-level2"
                aria-required="true"
                aria-invalid={!!errors.city}
                {...register("city")}
                className={fieldClass(!!errors.city)}
                placeholder="New York"
              />
              {errors.city && (
                <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3 w-3" />
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="state">State *</Label>
              <input
                id="state"
                type="text"
                autoComplete="address-level1"
                aria-required="true"
                aria-invalid={!!errors.state}
                {...register("state")}
                className={fieldClass(!!errors.state)}
                placeholder="NY"
              />
              {errors.state && (
                <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3 w-3" />
                  {errors.state.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="postalCode">Postal code *</Label>
              <input
                id="postalCode"
                type="text"
                autoComplete="postal-code"
                aria-required="true"
                aria-invalid={!!errors.postalCode}
                {...register("postalCode")}
                className={fieldClass(!!errors.postalCode)}
                placeholder="10001"
              />
              {errors.postalCode && (
                <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3 w-3" />
                  {errors.postalCode.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country">Country *</Label>
            <Select
              defaultValue="US"
              onValueChange={(val: string) => setValue("country", val as OrderFormValues["country"], { shouldValidate: true })}
            >
              <SelectTrigger id="country" aria-required="true" aria-invalid={!!errors.country} className={cn(!!errors.country && "border-destructive")}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">🇺🇸 United States</SelectItem>
                <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                <SelectItem value="FR">🇫🇷 France</SelectItem>
                <SelectItem value="IN">🇮🇳 India</SelectItem>
                <SelectItem value="JP">🇯🇵 Japan</SelectItem>
                <SelectItem value="other">🌍 Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-3 w-3" />
                {errors.country.message}
              </p>
            )}
          </div>
        </fieldset>

        <Separator />

        {/* ── Payment ──────────────────────────────────────────────── */}
        <fieldset className="space-y-4" disabled={isLoading}>
          <legend className="text-base font-semibold flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white text-xs">3</span>
            <CreditCard className="h-4 w-4" />
            Payment Method
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Payment method">
            {(
              [
                { value: "card", label: "Credit Card", icon: <CreditCard className="h-4 w-4" /> },
                { value: "paypal", label: "PayPal", icon: <Wallet className="h-4 w-4" /> },
                { value: "cod", label: "Cash on Delivery", icon: <Truck className="h-4 w-4" /> },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium transition-all",
                  paymentMethod === opt.value
                    ? "border-violet-600 bg-violet-600/5 text-violet-700 dark:text-violet-300"
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <input
                  type="radio"
                  value={opt.value}
                  {...register("paymentMethod")}
                  className="sr-only"
                  aria-label={opt.label}
                />
                {opt.icon}
                {opt.label}
              </label>
            ))}
          </div>
          {errors.paymentMethod && (
            <p className="text-xs text-destructive flex items-center gap-1" role="alert">
              <AlertCircle className="h-3 w-3" />
              {errors.paymentMethod.message}
            </p>
          )}

          {paymentMethod === "card" && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <Label htmlFor="cardNumber">Card number *</Label>
              <input
                id="cardNumber"
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                aria-required={paymentMethod === "card"}
                aria-describedby={errors.cardNumber ? "card-error" : undefined}
                aria-invalid={!!errors.cardNumber}
                {...register("cardNumber")}
                className={fieldClass(!!errors.cardNumber)}
              />
              {errors.cardNumber && (
                <p id="card-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cardNumber.message}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Demo only — enter any 16-digit number. No real payment is processed.
              </p>
            </div>
          )}
        </fieldset>

        <Separator />

        {/* ── Terms ────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3">
          <input
            id="agreeToTerms"
            type="checkbox"
            {...register("agreeToTerms")}
            className="mt-0.5 h-4 w-4 rounded border-input accent-violet-600"
            aria-describedby={errors.agreeToTerms ? "terms-error" : undefined}
            aria-required="true"
          />
          <div>
            <label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
              I agree to the{" "}
              <span className="underline cursor-pointer text-violet-600">Terms of Service</span> and{" "}
              <span className="underline cursor-pointer text-violet-600">Privacy Policy</span>
            </label>
            {errors.agreeToTerms && (
              <p id="terms-error" className="text-xs text-destructive flex items-center gap-1 mt-1" role="alert">
                <AlertCircle className="h-3 w-3" />
                {errors.agreeToTerms.message}
              </p>
            )}
          </div>
        </div>

        {/* ── Submit ───────────────────────────────────────────────── */}
        <Button
          type="submit"
          size="lg"
          disabled={isLoading || cartItems.length === 0}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 gap-2 h-12"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing order…
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Place Order (Demo)
            </>
          )}
        </Button>

        {cartItems.length === 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Your cart is empty.{" "}
            <Link href="/" className="underline text-violet-600">
              Go shopping
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
