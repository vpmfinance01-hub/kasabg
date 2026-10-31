import { num, round2, refundMethodFor, type NormItem, type Parsed, type PaymentCode } from "./types.ts";

const COUNTED = new Set(["processing", "completed", "refunded"]);

export function wooPayment(method: string): PaymentCode {
  const m = (method || "").toLowerCase();
  if (m === "cod") return 3;
  if (m === "bacs" || m === "cheque") return m === "bacs" ? 1 : 5;
  if (/stripe|paypal|ppcp|mollie|klarna|revolut|borica|paysera|epay|myPOS/i.test(m)) return 4;
  return 5;
}

// Поръчка от WooCommerce (REST/Webhook JSON). Сумите на редовете в WooCommerce са без ДДС.
export function parseWoo(body: Record<string, any>): Parsed {
  if (!body || typeof body !== "object" || body.id === undefined) return { ok: false, ignored: "not_an_order" };
  const status = String(body.status ?? "");
  if (!COUNTED.has(status)) return { ok: false, ignored: `status_${status || "unknown"}` };

  const items: NormItem[] = [];
  for (const li of (body.line_items ?? []) as any[]) {
    const qty = num(li.quantity) || 1;
    items.push({ name: String(li.name ?? "Артикул"), quantity: qty, price: round2(num(li.total) / qty) });
  }
  for (const sl of (body.shipping_lines ?? []) as any[]) {
    if (num(sl.total) > 0) items.push({ name: `Доставка${sl.method_title ? ": " + sl.method_title : ""}`, quantity: 1, price: round2(num(sl.total)) });
  }
  for (const fl of (body.fee_lines ?? []) as any[]) {
    if (num(fl.total) !== 0) items.push({ name: String(fl.name ?? "Такса"), quantity: 1, price: round2(num(fl.total)) });
  }

  const code = wooPayment(String(body.payment_method ?? ""));
  const b = body.billing ?? {};
  const created = String(body.date_created_gmt ?? body.date_created ?? "");
  const orderedAt = created ? (created.endsWith("Z") ? created : created + "Z") : new Date().toISOString();

  const refunds = ((body.refunds ?? []) as any[])
    .map((r) => ({ externalRef: `woo-${body.id}-${r.id}`, amount: Math.abs(round2(num(r.total))), date: orderedAt.slice(0, 10), method: refundMethodFor(code) }))
    .filter((r) => r.amount > 0);

  return {
    ok: true,
    order: {
      externalId: String(body.number ?? body.id),
      total: round2(num(body.total)),
      currency: String(body.currency ?? "EUR"),
      paymentMethod: String(body.payment_method ?? "other"),
      paymentCode: code,
      customerName: [b.first_name, b.last_name].filter(Boolean).join(" ") || undefined,
      customerEmail: b.email || undefined,
      country: b.country || undefined,
      orderedAt,
      items,
      refunds,
    },
  };
}
