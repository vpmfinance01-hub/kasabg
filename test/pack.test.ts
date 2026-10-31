import { test } from "node:test";
import assert from "node:assert/strict";
import { cell, ordersCsv, refundsCsv, summaryTxt } from "../src/lib/pack.ts";

const order = { external_id: "1001", ordered_at: "2026-10-22T10:00:00Z", customer_email: "a@b.bg", payment_method: "cod", total: 62.4, total_eur: 62.4, currency: "EUR", items: [{ name: "Чаша, голяма", quantity: 2, price: 7.25 }] };

test("CSV: запетаи и кавички се екранират, формулите се обезвреждат", () => {
  assert.equal(cell('Чаша, "голяма"'), '"Чаша, ""голяма"""');
  assert.equal(cell("=SUM(A1)"), "'=SUM(A1)");
  assert.equal(cell("-5.00"), "-5.00");
});

test("Поръчки: основа + ДДС = общо", () => {
  const lines = ordersCsv([order]).trim().split("\r\n");
  assert.equal(lines.length, 2);
  assert.match(lines[1], /52\.00,10\.40,62\.40,EUR$/);
});

test("Възстановени суми и резюме", () => {
  const r = { number: 5, order_ref: "1001", refunded_at: "2026-10-25", method_code: 3, amount: 10, status: "sent" };
  assert.match(refundsCsv([r]), /5,1001,2026-10-25,В брой,10\.00,изпратена/);
  const s = summaryTxt("Магазин", "2026-10", [order], [r], []);
  assert.match(s, /Поръчки: 1/);
  assert.match(s, /Оборот след възстановени суми: 52\.40/);
});

test("Пакетът на английски", () => {
  const en = (bg: string, e: string) => e;
  assert.match(ordersCsv([order], en), /^Order no\.,Date,Customer email/);
  assert.match(summaryTxt("Shop", "2026-10", [order], [], [], en), /Accountant's summary: Shop/);
});
