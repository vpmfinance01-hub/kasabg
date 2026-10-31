import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { buildReceiptPdf } from "../src/lib/receiptPdf.ts";

const base = {
  number: 127, store_name: "Керамика Родопи ЕООД", eik: "123456789", domain: "keramika.example", order_ref: "4821",
  date: "2026-10-26", time: "10:15:00", currency: "EUR", paym_code: 3, total: 66.57, brand_color: "#B4532A",
  items: [{ name: "Керамична чаша ×2", quantity: 2, price: 7.25 }, { name: "Комплект чинии с много дълго име, което трябва да се пренесе на нов ред", quantity: 1, price: 37.5 }],
};

test("PDF на бележка: валиден документ с една страница", async () => {
  const pdf = await buildReceiptPdf(base);
  assert.equal(Buffer.from(pdf.slice(0, 5)).toString(), "%PDF-");
  const doc = await PDFDocument.load(pdf);
  assert.equal(doc.getPageCount(), 1);
  assert.ok(Math.abs(doc.getPage(0).getWidth() - 226.77) < 0.1);
  assert.ok(doc.getPage(0).getHeight() > 200);
});

test("PDF: повече артикули дават по-висока страница", async () => {
  const a = await PDFDocument.load(await buildReceiptPdf(base));
  const many = await PDFDocument.load(await buildReceiptPdf({ ...base, items: [...base.items, ...base.items, ...base.items] }));
  assert.ok(many.getPage(0).getHeight() > a.getPage(0).getHeight());
});

test("PDF на кредитно известие", async () => {
  const pdf = await buildReceiptPdf({ kind: "credit", number: 5, orig_number: 127, store_name: "Керамика Родопи ЕООД", eik: "123456789", order_ref: "4821", date: "2026-10-27", currency: "EUR", method_code: 3, amount: 12 });
  const doc = await PDFDocument.load(pdf);
  assert.equal(doc.getPageCount(), 1);
  assert.match(doc.getTitle() ?? "", /Кредитно известие/);
});

test("PDF: лого от несъществуващ адрес не чупи документа", async () => {
  const pdf = await buildReceiptPdf({ ...base, logo_url: "https://invalid.invalid/logo.png" });
  assert.equal(Buffer.from(pdf.slice(0, 5)).toString(), "%PDF-");
});

test("PDF с двуезични етикети е по-висок от българския", async () => {
  const bg = await PDFDocument.load(await buildReceiptPdf(base));
  const bi = await PDFDocument.load(await buildReceiptPdf({ ...base, lang: "bi" }));
  assert.ok(bi.getPage(0).getHeight() >= bg.getPage(0).getHeight());
});
