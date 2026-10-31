"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { PAYMENT_CODES } from "@/lib/csv";
import type { Store } from "@/lib/types";
import { useT } from "@/components/LangProvider";

type Row = { name: string; qty: string; price: string };
const emptyRow = (): Row => ({ name: "", qty: "1", price: "" });
const num = (s: string) => Number(String(s).replace(",", "."));
const m2 = (n: number) => (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);

/** Ръчно добавяне на поръчка с един или повече артикула. Цените са с ДДС, както излизат в бележката. */
export default function ManualOrder({ store, onDone, onMsg }: { store: Store; onDone: () => void; onMsg: (m: string) => void }) {
  const t = useT();
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const set = (i: number, k: keyof Row, v: string) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
  const lineTotal = (r: Row) => (num(r.qty) > 0 && num(r.price) > 0 ? r2(num(r.qty) * num(r.price)) : 0);
  const total = rows.reduce((s, r) => s + lineTotal(r), 0);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const f = new FormData(e.currentTarget);
    const filled = rows.filter((r) => r.name.trim() || r.price.trim());
    if (filled.length === 0) return setErr(t("Добавете поне един артикул.", "Add at least one item."));
    for (const r of filled) {
      if (!r.name.trim()) return setErr(t("Всеки артикул трябва да има име.", "Every item needs a name."));
      if (!(num(r.qty) > 0) || Math.round(num(r.qty) * 1000) / 1000 !== num(r.qty)) return setErr(t(`Количеството на „${r.name}“ трябва да е над 0, най-много с 3 знака след запетаята (напр. 0,5).`, `The quantity of “${r.name}” must be above 0, with at most 3 decimals (e.g. 0.5).`));
      if (!(num(r.price) > 0)) return setErr(t(`Цената на „${r.name}“ трябва да е над 0.`, `The price of “${r.name}” must be above 0.`));
    }
    const pay = String(f.get("payment"));
    setBusy(true);
    const { error } = await sb.rpc("ingest_order", {
      p_api_key: store.api_key,
      p_external_id: String(f.get("order_id")).trim(),
      // общата сума е сборът на редовете с ДДС; базата пази цената без ДДС с 4 знака, за да няма разлика от стотинка
      p_total: +filled.reduce((s, r) => s + lineTotal(r), 0).toFixed(2),
      p_currency: "EUR",
      p_payment_method: pay,
      p_customer_name: String(f.get("name")) || null,
      p_customer_email: String(f.get("email")) || null,
      p_ordered_at: new Date(String(f.get("date"))).toISOString(),
      p_items: filled.map((r) => ({ name: r.name.trim(), quantity: num(r.qty), price: +(num(r.price) / 1.2).toFixed(4) })),
      p_paym_code: PAYMENT_CODES[pay] ?? 5,
    });
    setBusy(false);
    if (error) return setErr(t("Грешка: ", "Error: ") + error.message);
    onMsg(t(`Поръчката е добавена с ${filled.length} ${filled.length === 1 ? "артикул" : "артикула"}.`, `The order was added with ${filled.length} ${filled.length === 1 ? "item" : "items"}.`));
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl bg-accent p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <input name="order_id" required placeholder={t("№ на поръчка", "Order no.")} className="input" />
        <input name="date" required type="date" defaultValue={new Date().toLocaleDateString("sv-SE")} className="input" />
        <input name="name" placeholder={t("Клиент", "Customer")} className="input" />
        <input name="email" type="email" placeholder={t("Имейл на клиента (за бележката)", "Customer email (for the receipt)")} className="input" />
      </div>

      <div>
        <div className="hidden grid-cols-[1fr_5rem_8rem_6rem_2rem] gap-2 px-1 pb-1 font-mono text-[11px] uppercase tracking-wider text-muted md:grid">
          <span>{t("Артикул", "Item")}</span><span>{t("Бройки", "Qty")}</span><span>{t("Цена с ДДС (за 1)", "Price incl. VAT (each)")}</span><span className="text-right">{t("Ред", "Line")}</span><span />
        </div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_5rem] gap-2 md:grid-cols-[1fr_5rem_8rem_6rem_2rem] md:items-center">
              <input value={r.name} onChange={(e) => set(i, "name", e.target.value)} placeholder={t("Име на артикула", "Item name")} className="input" aria-label={t(`Артикул ${i + 1}`, `Item ${i + 1}`)} />
              <input value={r.qty} onChange={(e) => set(i, "qty", e.target.value)} inputMode="decimal" placeholder={t("1 или 0,5", "1 or 0.5")} className="input" aria-label={t("Бройки (може и под 1, напр. 0,5)", "Quantity (can be below 1, e.g. 0.5)")} />
              <input value={r.price} onChange={(e) => set(i, "price", e.target.value)} inputMode="decimal" placeholder={t("напр. 12.00", "e.g. 12.00")} className="input" aria-label={t("Цена с ДДС за 1 бройка", "Price incl. VAT per unit")} />
              <div className="text-right font-mono text-sm tabular-nums">{lineTotal(r) ? m2(lineTotal(r)) : "—"}</div>
              <button type="button" className="text-lg leading-none text-muted hover:text-brand disabled:opacity-30" disabled={rows.length === 1} onClick={() => setRows((x) => x.filter((_, j) => j !== i))} aria-label={t("Махни артикула", "Remove item")}>×</button>
            </div>
          ))}
        </div>
        <button type="button" className="mt-3 text-sm font-semibold text-brand-dark" onClick={() => setRows((x) => [...x, emptyRow()])}>{t("+ Добави още артикул", "+ Add another item")}</button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <select name="payment" className="input !w-auto">
          <option value="cod">{t("Наложен платеж", "Cash on delivery")}</option>
          <option value="bank">{t("Банков превод", "Bank transfer")}</option>
          <option value="paypal">{t("PayPal / платежна услуга", "PayPal / payment service")}</option>
          <option value="other">{t("Друго", "Other")}</option>
        </select>
        <div className="font-mono text-sm">{t("Общо с ДДС:", "Total incl. VAT:")} <b className="text-lg">{m2(total)} €</b></div>
      </div>

      {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">{err}</p>}
      <div className="flex items-center gap-3">
        <button className="btn" disabled={busy}>{busy ? t("Записва се…", "Saving…") : t("Добави поръчката", "Add the order")}</button>
        <span className="text-xs text-muted">{t("Цените са с ДДС 20% и така излизат в бележката. За плащане с карта през ПОС ползвайте CSV.", "Prices include 20% VAT and appear this way on the receipt. For card payments through a POS use CSV.")}</span>
      </div>
    </form>
  );
}
