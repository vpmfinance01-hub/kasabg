import { num, round2, refundMethodFor, type NormItem, type Parsed, type PaymentCode } from "./types.ts";

const PAY: Record<string, PaymentCode> = {
  bank: 1, transfer: 1, bacs: 1,
  card: 2, vpos: 2,
  cod: 3,
  paypal: 4, stripe: 4, service: 4,
  other: 5,
};

/**
 * Универсален формат (за PrestaShop, Magento, Wix, OpenCart и собствени магазини):
 * { order_id, date, total, currency, payment, email, name, country, status, vat_rate,
 *   items: [{ name, qty, price_excl_vat | price_incl_vat }], refunds: [{ id, amount, date }] }
 * Липсваща обща сума се смята от артикулите. Статус pending/cancelled/failed... се пропуска.
 */
const SKIP_STATUS = new Set(["pending", "unpaid", "draft", "failed", "cancelled", "canceled", "void", "abandoned"]);

export function parseGeneric(body: Record<string, any>): Parsed {
  if (!body || typeof body !== "object" || !body.order_id) return { ok: false, ignored: "missing_order_id" };
  // по избор: ако свързващата услуга (Zapier, Make) подава статус, чакащите и отказаните не се записват
  const status = String(body.status ?? "").toLowerCase();
  if (SKIP_STATUS.has(status)) return { ok: false, ignored: `status_${status}` };
  const pay = String(body.payment ?? "other").toLowerCase();
  const code = PAY[pay] ?? 5;
  const vatDiv = 1 + (num(body.vat_rate) || 20) / 100;
  const items: NormItem[] = ((body.items ?? []) as any[]).map((i) => ({
    name: String(i.name ?? "Артикул"),
    quantity: num(i.qty ?? i.quantity) || 1,
    // цена без ДДС или цена с ДДС (тогава се превръща)
    price: round2(i.price_excl_vat != null ? num(i.price_excl_vat) : i.price_incl_vat != null ? num(i.price_incl_vat) / vatDiv : num(i.price)),
  }));
  const itemsGross = items.reduce((s, i) => s + i.price * i.quantity * vatDiv, 0);
  const date = body.date ? new Date(String(body.date)) : new Date();
  const orderedAt = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  const refunds = ((body.refunds ?? []) as any[])
    .map((r, idx) => ({
      externalRef: String(r.id ?? `gen-${body.order_id}-${idx}`),
      amount: round2(Math.abs(num(r.amount))),
      date: String(r.date ?? orderedAt).slice(0, 10),
      method: refundMethodFor(code),
    }))
    .filter((r) => r.amount > 0);
  return {
    ok: true,
    order: {
      externalId: String(body.order_id),
      total: round2(body.total != null && body.total !== "" ? num(body.total) : itemsGross),
      currency: String(body.currency ?? "EUR"),
      paymentMethod: pay,
      paymentCode: code,
      customerName: body.name || undefined,
      customerEmail: body.email || undefined,
      country: body.country || undefined,
      orderedAt,
      items,
      refunds,
    },
  };
}
