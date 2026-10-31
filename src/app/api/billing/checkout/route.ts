import { NextResponse } from "next/server";
import { anonClient } from "@/lib/mail";
import { tFromRequest } from "@/lib/i18n";
import { PAID_PLANS, type PlanKey } from "@/lib/plans";
import { priceId, siteUrl, stripeClient, stripeEnabled } from "@/lib/stripe";

export const runtime = "nodejs";

// Вика се от таблото. Връща адрес към страницата за плащане на Stripe или към управлението на абонамента.
export async function POST(req: Request) {
  const t = tFromRequest(req);
  if (!stripeEnabled()) return NextResponse.json({ ok: false, message: t("Онлайн плащането още не е включено. Пишете ни и ще активираме плана.", "Online payment is not enabled yet. Write to us and we will activate the plan.") }, { status: 503 });

  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ ok: false, message: t("Не сте влезли.", "You are not logged in.") }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { store_id?: string; plan?: string; interval?: string; portal?: boolean };
  const storeId = body.store_id ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(storeId)) return NextResponse.json({ ok: false, message: t("Липсва магазин.", "No shop given.") }, { status: 400 });

  const sb = anonClient(token);
  const { data: user } = await sb.auth.getUser(token);
  const info = await sb.rpc("get_billing_info", { p_store: storeId });
  if (info.error || !user.user) return NextResponse.json({ ok: false, message: t("Нямате право да управлявате този магазин.", "You are not allowed to manage this shop.") }, { status: 403 });
  const { customer } = info.data as { customer: string | null };

  const stripe = stripeClient();
  const back = `${siteUrl()}/app`;

  if (body.portal) {
    if (!customer) return NextResponse.json({ ok: false, message: t("Още няма абонамент.", "There is no subscription yet.") }, { status: 400 });
    const s = await stripe.billingPortal.sessions.create({ customer, return_url: back });
    return NextResponse.json({ ok: true, url: s.url });
  }

  const plan = body.plan as PlanKey;
  const interval = body.interval === "year" ? "year" : "month";
  if (!PAID_PLANS.includes(plan)) return NextResponse.json({ ok: false, message: t("Непознат план.", "Unknown plan.") }, { status: 400 });
  const price = priceId(plan, interval);
  if (!price) return NextResponse.json({ ok: false, message: t("Този план още не е настроен за плащане.", "This plan is not set up for payment yet.") }, { status: 503 });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    ...(customer ? { customer } : { customer_email: user.user.email }),
    client_reference_id: storeId,
    metadata: { store_id: storeId, plan },
    subscription_data: { metadata: { store_id: storeId, plan } },
    allow_promotion_codes: true,
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    success_url: `${back}?paid=1`,
    cancel_url: back,
  });
  return NextResponse.json({ ok: true, url: session.url });
}
