// Справка за счетоводителя: CSV файлове и резюме за един месец. Чисти функции, без достъп до мрежата.
// Езикът на заглавията е български по подразбиране; таблото подава избрания език.
import { makeT, type T } from "./i18n.ts";

export type PackOrder = {
  external_id: string; ordered_at: string; customer_email: string | null; payment_method: string;
  total: number; total_eur: number | null; currency: string; items: { name: string; quantity: number; price: number }[];
};
export type PackReceipt = { number: number; order_ref: string; status: string; sent_at: string | null };
export type PackRefund = { number: number | null; order_ref: string; refunded_at: string; method_code: number; amount: number; status: string };

const bg = makeT("bg");
const methods = (t: T): Record<number, string> => ({ 1: "IBAN", 2: t("Карта", "Card"), 3: t("В брой", "Cash"), 4: t("Друго", "Other") });
const statuses = (t: T): Record<string, string> => ({
  pending: t("чака", "waiting"),
  sent: t("изпратена", "sent"),
  no_email: t("няма имейл", "no email"),
  failed: t("неуспешна", "failed"),
  blocked: t("спряна (няма активен план)", "paused (no active plan)"),
  old: "—",
});
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const fmt = (n: number) => r2(n).toFixed(2);

/** Клетка за CSV със запетая като разделител и екраниране на кавички. Предпазва от формули в Excel. */
export function cell(v: unknown): string {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s)) s = "'" + s;
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export const csv = (header: string[], rows: unknown[][]) => [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";

export function ordersCsv(orders: PackOrder[], t: T = bg) {
  return csv(
    [t("№ на поръчка", "Order no."), t("Дата", "Date"), t("Имейл на клиента", "Customer email"), t("Плащане", "Payment"), t("Артикули", "Items"), t("Данъчна основа", "Tax base"), t("ДДС 20%", "VAT 20%"), t("Общо с ДДС", "Total incl. VAT"), t("Валута", "Currency")],
    orders.map((o) => {
      const total = Number(o.total);
      return [o.external_id, o.ordered_at.slice(0, 10), o.customer_email ?? "", o.payment_method,
        o.items.map((i) => `${i.name} x${i.quantity}`).join("; "), fmt(total / 1.2), fmt(total - total / 1.2), fmt(total), o.currency];
    })
  );
}

export function receiptsCsv(receipts: PackReceipt[], t: T = bg) {
  const st = statuses(t);
  return csv(
    [t("№ на бележка", "Receipt no."), t("№ на поръчка", "Order no."), t("Статус", "Status"), t("Изпратена на", "Sent on")],
    receipts.map((r) => [String(r.number).padStart(10, "0"), r.order_ref, st[r.status] ?? r.status, r.sent_at ? r.sent_at.slice(0, 16).replace("T", " ") : ""])
  );
}

export function refundsCsv(refunds: PackRefund[], t: T = bg) {
  const st = statuses(t);
  const mt = methods(t);
  return csv(
    [t("№ на кредитно известие", "Credit note no."), t("№ на поръчка", "Order no."), t("Дата", "Date"), t("Метод", "Method"), t("Сума", "Amount"), t("Известие до клиента", "Notice to the customer")],
    refunds.map((r) => [r.number ?? "", r.order_ref, r.refunded_at, mt[r.method_code] ?? t("Друго", "Other"), fmt(Number(r.amount)), st[r.status] ?? r.status])
  );
}

export function summaryTxt(storeName: string, period: string, orders: PackOrder[], refunds: PackRefund[], receipts: PackReceipt[], t: T = bg) {
  const total = orders.reduce((s, o) => s + Number(o.total_eur ?? o.total), 0);
  const refunded = refunds.reduce((s, r) => s + Number(r.amount), 0);
  const noMail = receipts.filter((r) => r.status === "no_email").length;
  const unsent = receipts.filter((r) => r.status === "failed" || r.status === "pending" || r.status === "blocked").length;
  return [
    `${t("Справка за счетоводителя", "Accountant's summary")}: ${storeName}`,
    `${t("Период", "Period")}: ${period}`,
    "",
    `${t("Поръчки", "Orders")}: ${orders.length}`,
    `${t("Оборот с ДДС (EUR)", "Turnover incl. VAT (EUR)")}: ${fmt(total)}`,
    `${t("Данъчна основа (20%)", "Tax base (20%)")}: ${fmt(total / 1.2)}`,
    `${t("ДДС 20%", "VAT 20%")}: ${fmt(total - total / 1.2)}`,
    `${t("Възстановени суми", "Refunds")}: ${refunds.length} ${t("на обща стойност", "totalling")} ${fmt(refunded)}`,
    `${t("Оборот след възстановени суми", "Turnover after refunds")}: ${fmt(total - refunded)}`,
    "",
    `${t("Бележки без имейл на клиента", "Receipts without a customer email")}: ${noMail}`,
    `${t("Бележки, които не са изпратени", "Receipts not sent")}: ${unsent}`,
    "",
    t("Сумите са в евро и са изчислени с ДДС 20%. Проверете ги спрямо счетоводството, преди да ги ползвате.", "Amounts are in euro and calculated with 20% VAT. Check them against the books before you use them."),
  ].join("\r\n");
}
