import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyAnswers, validate, warnings, type Answers } from "../src/lib/declaration.ts";

const ok = (over: Partial<Answers> = {}): Answers => ({
  ...emptyAnswers(), nap_registered: "yes", nap_number: "123", payments: ["card_vpos"], card_account_own: "yes",
  payment_provider: "Банка", vat_registered: "no", other_system: "no", accountant_consulted: "yes",
  confirm_data: true, confirm_authority: true, confirm_responsibility: true, confirm_gdpr: true, ...over,
});

test("Празна декларация е невалидна, пълната е валидна", () => {
  assert.ok(validate(emptyAnswers()).length > 5);
  assert.deepEqual(validate(ok()), []);
});

test("Условните полета се изискват", () => {
  assert.ok(validate(ok({ nap_number: "" })).some((e) => e.includes("номера")));
  assert.ok(validate(ok({ card_account_own: "" })).length > 0);
  assert.ok(validate(ok({ vat_registered: "yes", vat_number: "" })).some((e) => e.includes("ЗДДС")));
  assert.ok(validate(ok({ other_system: "yes", other_system_note: "" })).length > 0);
  // без карти не се иска сметка и доставчик
  assert.deepEqual(validate(ok({ payments: ["bank_transfer"], card_account_own: "", payment_provider: "" })), []);
});

test("Без потвърждение няма запис", () => {
  assert.ok(validate(ok({ confirm_responsibility: false })).length > 0);
});

test("Предупреждения: наложен платеж, чужда сметка, липсваща регистрация", () => {
  assert.deepEqual(warnings(ok()), []);
  assert.ok(warnings(ok({ payments: ["card_vpos", "cod"] })).some((w) => w.text.includes("наложения платеж")));
  assert.ok(warnings(ok({ card_account_own: "no" })).some((w) => w.level === "error"));
  assert.ok(warnings(ok({ nap_registered: "pending" })).some((w) => w.text.includes("Приложение 33")));
});
