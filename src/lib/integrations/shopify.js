import { num, round2, refundMethodFor } from "./types.js";
export function shopifyPayment(gateways) {
  const g = gateways.join(" ").toLowerCase();
  if (/cash on delivery|\bcod\b|наложен/.test(g)) return 3;
  if (/bank|wire|превод|deposit/.test(g)) return 1;
  if (/shopify_payments|shopify payments|stripe|paypal|klarna|mollie|revolut|borica|paysera|epay|mypos/.test(g)) return 4;
  return 5;
}
// Поръчка от Shopify (webhook orders/create, orders/paid, orders/updated).
// Цената на ред може да е с ДДС (taxes_included) или без: нетната стойност се смята от tax_lines.
export function parseShopify(body) {
  if (!body || typeof body !== "object" || body.id === undefined) return { ok: false, ignored: "not_an_order" };
  if (body.test === true) return { ok: false, ignored: "test_order" };
  if (body.cancelled_at) return { ok: false, ignored: "cancelled" };
  const incl = body.taxes_included === true;
  const items = [];
  const addLine = (name, qty, gross, tax) => {
    const net = incl ? gross - tax : gross;
    items.push({ name, quantity: qty, price: round2(net / (qty || 1)) });
  };
  for (const li of body.line_items ?? []) {
    const qty = num(li.quantity) || 1;
    const gross = num(li.price) * qty - num(li.total_discount);
    const tax = (li.tax_lines ?? []).reduce((s, t) => s + num(t.price), 0);
    addLine(String(li.title ?? li.name ?? "Артикул"), qty, gross, tax);
  }
  for (const sl of body.shipping_lines ?? []) {
    const gross = num(sl.discounted_price ?? sl.price);
    const tax = (sl.tax_lines ?? []).reduce((s, t) => s + num(t.price), 0);
    if (gross > 0) addLine(`Доставка${sl.title ? ": " + sl.title : ""}`, 1, gross, tax);
  }
  const gateways = body.payment_gateway_names ?? (body.gateway ? [body.gateway] : []);
  const code = shopifyPayment(gateways);
  const cust = body.customer ?? {};
  const orderedAt = String(body.created_at ?? new Date().toISOString());
  const name = String(body.name ?? body.order_number ?? body.id).replace(/^#/, "");
  const refunds = (body.refunds ?? [])
    .map((r) => {
      const amount = (r.transactions ?? [])
        .filter((t) => (t.kind ?? "refund") === "refund" && (t.status ?? "success") === "success")
        .reduce((s, t) => s + num(t.amount), 0);
      return {
        externalRef: `shp-${body.id}-${r.id}`,
        amount: round2(amount),
        date: String(r.created_at ?? orderedAt).slice(0, 10),
        method: refundMethodFor(code),
      };
    })
    .filter((r) => r.amount > 0);
  return {
    ok: true,
    order: {
      externalId: name,
      total: round2(num(body.total_price)),
      currency: String(body.currency ?? body.presentment_currency ?? "EUR"),
      paymentMethod: gateways[0] ?? "other",
      paymentCode: code,
      customerName: [cust.first_name, cust.last_name].filter(Boolean).join(" ") || undefined,
      customerEmail: body.email || cust.email || undefined,
      country: body.billing_address?.country_code || body.shipping_address?.country_code || undefined,
      orderedAt,
      items,
      refunds,
    },
  };
}
