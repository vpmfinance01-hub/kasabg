import type { Order, Store, Refund } from "./types";
import { makeT, type T } from "./i18n.ts";

export type Check = { level: "error" | "warn" | "info"; text: string };

export function runChecks(store: Store, orders: Order[], refunds: Refund[], period: string, t: T = makeT("bg")): Check[] {
  const c: Check[] = [];
  if (!store.eik) c.push({ level: "error", text: t("Липсва ЕИК на магазина.", "The shop's company ID (EIK) is missing.") });
  if (!store.website) c.push({ level: "error", text: t("Липсва домейн на магазина.", "The shop's domain is missing.") });
  if (!store.nap_shop_number) c.push({ level: "error", text: t("Липсва уникален номер на магазина от НАП (чл. 52р).", "The shop's unique NRA number is missing (art. 52r).") });

  const inP = orders.filter((o) => o.ordered_at.startsWith(period));
  if (inP.length === 0) c.push({ level: "warn", text: t("Няма поръчки за избрания месец. Файлът ще е празен.", "There are no orders for the selected month. The file will be empty.") });

  const noMail = inP.filter((o) => !o.customer_email).length;
  if (noMail) c.push({ level: "warn", text: t(`${noMail} поръчки са без имейл: електронна бележка не може да бъде изпратена.`, `${noMail} orders have no email: an electronic receipt cannot be sent.`) });

  const bad = inP.filter((o) => !(Number(o.total) > 0)).length;
  if (bad) c.push({ level: "error", text: t(`${bad} поръчки са с нулева или отрицателна сума.`, `${bad} orders have a zero or negative total.`) });

  const seen = new Set<string>();
  let dup = 0;
  for (const o of inP) {
    const k = o.doc_number ?? o.external_id;
    if (seen.has(k)) dup++;
    seen.add(k);
  }
  if (dup) c.push({ level: "error", text: t(`${dup} поръчки имат повтарящ се номер на документ.`, `${dup} orders have a duplicate document number.`) });

  const vposNoRef = inP.filter((o) => o.paym_code === 2 && (!o.pos_n || !o.trans_n || !o.proc_id)).length;
  if (vposNoRef) c.push({ level: "error", text: t(`${vposNoRef} плащания през виртуален ПОС са без ПОС номер, RRN или ЕИК на доставчика.`, `${vposNoRef} virtual POS payments are missing the POS number, RRN or the provider's company ID.`) });

  const noItems = inP.filter((o) => !o.items.length).length;
  if (noItems) c.push({ level: "info", text: t(`${noItems} поръчки са без артикули: ще се запишат като един ред с ДДС 20%.`, `${noItems} orders have no items: they will be recorded as a single line with 20% VAT.`) });

  const other = inP.filter((o) => o.paym_code === 5).length;
  if (other) c.push({ level: "info", text: t(`${other} поръчки са с начин на плащане „друго“. Проверете дали е правилно.`, `${other} orders use the payment method “other”. Check that this is right.`) });

  const orderRefs = new Set(orders.map((o) => o.external_id));
  const orphan = refunds.filter((r) => !orderRefs.has(r.order_ref)).length;
  if (orphan) c.push({ level: "warn", text: t(`${orphan} възстановени суми са към поръчки, които не са в системата.`, `${orphan} refunds belong to orders that are not in the system.`) });

  return c;
}

export function deadline(period: string): { date: string; daysLeft: number } {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 15));
  const daysLeft = Math.ceil((d.getTime() - Date.now()) / 86400000);
  return { date: d.toISOString().slice(0, 10), daysLeft };
}
