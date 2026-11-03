// Stripe е включен само когато са зададени ключовете. Само за сървърни маршрути.
import Stripe from "stripe";
export const stripeEnabled = () => !!process.env.STRIPE_SECRET_KEY;
export const stripeClient = () => new Stripe(process.env.STRIPE_SECRET_KEY);
/** Идентификатор на цената в Stripe: STRIPE_PRICE_<ПЛАН>_<MONTHLY|YEARLY> */
export const priceId = (plan, interval) => process.env[`STRIPE_PRICE_${plan.toUpperCase()}_${interval === "year" ? "YEARLY" : "MONTHLY"}`];
/** Обратно: от цена към план (за webhook-а). */
export function planForPrice(id) {
  if (!id) return null;
  for (const plan of ["starter", "essential", "premium"]) {
    for (const interval of ["month", "year"]) if (priceId(plan, interval) === id) return plan;
  }
  return null;
}
export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://smwebsites.org";
