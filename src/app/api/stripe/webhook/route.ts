import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { anonClient } from "@/lib/mail";
import { planForPrice, stripeClient, stripeEnabled } from "@/lib/stripe";

export const runtime = "nodejs";

const STATUS: Record<string, "active" | "past_due" | "canceled"> = {
  active: "active",
  trialing: "active",
  past_due: "past_due",
  unpaid: "past_due",
  canceled: "canceled",
  incomplete_expired: "canceled",
};

async function apply(storeId: string, sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const status = STATUS[sub.status];
  if (!status) return; // incomplete и т.н.: чакаме следващо събитие
  const periodEnd = (item as unknown as { current_period_end?: number }).current_period_end;
  const r = await anonClient().rpc("billing_apply", {
    p_secret: process.env.N8N_SECRET,
    p_store: storeId,
    p_plan: planForPrice(item?.price.id) ?? sub.metadata?.plan ?? null,
    p_status: status,
    p_customer: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    p_subscription: sub.id,
    p_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
  });
  if (r.error) throw new Error(r.error.message);
}

// Stripe → КасаБГ. Подписът се проверява със STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  if (!stripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ ok: false }, { status: 503 });
  const stripe = stripeClient();
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, req.headers.get("stripe-signature") ?? "", process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ ok: false, message: "bad signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const storeId = s.client_reference_id ?? s.metadata?.store_id;
      if (storeId && s.subscription) await apply(storeId, await stripe.subscriptions.retrieve(typeof s.subscription === "string" ? s.subscription : s.subscription.id));
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const storeId = sub.metadata?.store_id;
      if (storeId) await apply(storeId, sub);
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 }); // Stripe ще опита пак
  }
  return NextResponse.json({ ok: true });
}
