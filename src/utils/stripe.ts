import Stripe from "stripe";

// Explicit type annotation: required because the tsconfig emits declarations
export const stripe: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Stripe takes amounts in the smallest unit (cents), so 110 BDT at 110 per USD becomes 100 cents
export function bdtToUsdCents(amountBdt: number): number {
  const rate = Number(process.env.BDT_PER_USD ?? 110);
  return Math.round((amountBdt / rate) * 100);
}