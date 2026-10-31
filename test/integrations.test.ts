import { test } from "node:test";
import assert from "node:assert/strict";
import { parseWoo } from "../src/lib/integrations/woocommerce.ts";
import { parseShopify } from "../src/lib/integrations/shopify.ts";
import { parseGeneric } from "../src/lib/integrations/generic.ts";

// ---- WooCommerce ----
const woo = (over: Record<string, any> = {}) => ({
  id: 1001, number: "1001", status: "processing", currency: "EUR", total: "62.40",
  date_created_gmt: "2026-10-22T10:15:00", payment_method: "cod",
  billing: { first_name: "Иван", last_name: "Иванов", email: "ivan@example.com", country: "BG" },
  line_items: [{ name: "Комплект чинии", quantity: 1, total: "37.50" }, { name: "Чаша", quantity: 2, total: "14.50" }],
  shipping_lines: [{ method_title: "Еконт", total: "0.00" }],
  refunds: [],
  ...over,
});

test("WooCommerce: наложен платеж, нетни цени, количество", () => {
  const r = parseWoo(woo());
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.order.externalId, "1001");
  assert.equal(r.order.paymentCode, 3);
  assert.equal(r.order.total, 62.4);
  assert.equal(r.order.customerEmail, "ivan@example.com");
  assert.deepEqual(r.order.items.map((i) => [i.name, i.quantity, i.price]), [["Комплект чинии", 1, 37.5], ["Чаша", 2, 7.25]]);
  assert.equal(r.order.orderedAt, "2026-10-22T10:15:00Z");
});

test("WooCommerce: доставка се добавя като ред, а нулева не", () => {
  const r = parseWoo(woo({ shipping_lines: [{ method_title: "Спиди", total: "4.17" }] }));
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.order.items.at(-1)!.name, "Доставка: Спиди");
  const z = parseWoo(woo());
  if (z.ok) assert.equal(z.order.items.length, 2);
});

test("WooCommerce: чакаща и отказана поръчка се пропускат", () => {
  for (const s of ["pending", "on-hold", "cancelled", "failed", "draft", "trash"]) {
    const r = parseWoo(woo({ status: s }));
    assert.equal(r.ok, false, s);
  }
});

test("WooCommerce: възстановена сума и методи на плащане", () => {
  const r = parseWoo(woo({ payment_method: "bacs", status: "refunded", refunds: [{ id: 7, total: "-10.00" }] }));
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.order.paymentCode, 1);
  assert.deepEqual(r.order.refunds.map((x) => [x.externalRef, x.amount, x.method]), [["woo-1001-7", 10, 1]]);
  const p = parseWoo(woo({ payment_method: "stripe" }));
  if (p.ok) assert.equal(p.order.paymentCode, 4);
});

test("WooCommerce: невалиден обект", () => {
  assert.equal(parseWoo({} as any).ok, false);
});

// ---- Shopify ----
const shop = (over: Record<string, any> = {}) => ({
  id: 555001, name: "#1042", currency: "EUR", total_price: "60.00", taxes_included: true,
  created_at: "2026-10-22T09:00:00+02:00", email: "maria@example.com",
  customer: { first_name: "Мария", last_name: "Петрова" }, billing_address: { country_code: "BG" },
  payment_gateway_names: ["Cash on Delivery (COD)"],
  line_items: [{ title: "Лампа", quantity: 1, price: "60.00", total_discount: "0.00", tax_lines: [{ price: "10.00", rate: 0.2 }] }],
  shipping_lines: [], refunds: [],
  ...over,
});

test("Shopify: цена с ДДС се превръща в нетна по tax_lines", () => {
  const r = parseShopify(shop());
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.order.externalId, "1042");
  assert.equal(r.order.paymentCode, 3);
  assert.equal(r.order.total, 60);
  assert.deepEqual(r.order.items, [{ name: "Лампа", quantity: 1, price: 50 }]);
});

test("Shopify: цени без ДДС и отстъпка", () => {
  const r = parseShopify(shop({ taxes_included: false, line_items: [{ title: "Лампа", quantity: 2, price: "25.00", total_discount: "5.00", tax_lines: [{ price: "9.00" }] }] }));
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.order.items, [{ name: "Лампа", quantity: 2, price: 22.5 }]);
});

test("Shopify: тестови и отказани поръчки се пропускат", () => {
  assert.equal(parseShopify(shop({ test: true })).ok, false);
  assert.equal(parseShopify(shop({ cancelled_at: "2026-10-23T00:00:00Z" })).ok, false);
});

test("Shopify: възстановена сума и платежна услуга", () => {
  const r = parseShopify(shop({ payment_gateway_names: ["shopify_payments"], refunds: [{ id: 9, created_at: "2026-10-25T10:00:00Z", transactions: [{ kind: "refund", status: "success", amount: "20.00" }, { kind: "refund", status: "failure", amount: "5.00" }] }] }));
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.order.paymentCode, 4);
  assert.deepEqual(r.order.refunds, [{ externalRef: "shp-555001-9", amount: 20, date: "2026-10-25", method: 2 }]);
});

// ---- Универсален ----
test("Универсален формат: поръчка, плащане и възстановена сума", () => {
  const r = parseGeneric({ order_id: "A-77", date: "2026-10-22", total: "24,00", payment: "card", email: "x@y.bg", items: [{ name: "Чаша", qty: 2, price_excl_vat: "10.00" }], refunds: [{ id: "r1", amount: "5", date: "2026-10-24" }] });
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.order.total, 24);
  assert.equal(r.order.paymentCode, 2);
  assert.deepEqual(r.order.items, [{ name: "Чаша", quantity: 2, price: 10 }]);
  assert.deepEqual(r.order.refunds, [{ externalRef: "r1", amount: 5, date: "2026-10-24", method: 2 }]);
  assert.equal(parseGeneric({} as any).ok, false);
});

test("Универсален формат: цена с ДДС, липсваща обща сума, статус", () => {
  const r = parseGeneric({ order_id: "B-1", items: [{ name: "Лампа", qty: 2, price_incl_vat: "12.00" }] });
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.deepEqual(r.order.items, [{ name: "Лампа", quantity: 2, price: 10 }]);
  assert.equal(r.order.total, 24);
  const d = parseGeneric({ order_id: "B-2", status: "Cancelled", total: 5 });
  assert.equal(d.ok, false);
  if (!d.ok) assert.equal(d.ignored, "status_cancelled");
});
