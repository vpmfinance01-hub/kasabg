"use client";
import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { parseCsv, PAYMENT_CODES, CSV_TEMPLATE } from "@/lib/csv";
import type { Store, Order } from "@/lib/types";
import ManualOrder from "./ManualOrder";
import { useT } from "@/components/LangProvider";

export default function Orders({ store, orders, reload, readOnly }: { store: Store; orders: Order[]; reload: () => void; readOnly: boolean }) {
  const t = useT();
  const sb = supabaseBrowser();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [manual, setManual] = useState(false);

  async function importCsv(f: File) {
    const rows = parseCsv(await f.text());
    // един ред = един артикул; редовете с един и същ order_id се групират
    const byOrder = new Map<string, Record<string, string>[]>();
    for (const r of rows) {
      const id = r["order_id"];
      if (!id) continue;
      byOrder.set(id, [...(byOrder.get(id) ?? []), r]);
    }
    let ok = 0;
    let fail = 0;
    for (const [id, lines] of byOrder) {
      const r = lines[0];
      const items = lines
        .filter((l) => l["item_name"])
        .map((l) => ({
          name: l["item_name"],
          quantity: Number(String(l["item_qty"] || "1").replace(",", ".")) || 1,
          price: Number((l["item_price_no_vat"] || "0").replace(",", ".")),
        }));
      const { error } = await sb.rpc("ingest_order", {
        p_api_key: store.api_key,
        p_external_id: id,
        p_total: Number((r["total"] || "0").replace(",", ".")),
        p_currency: r["currency"] || "EUR",
        p_payment_method: r["payment"] || "other",
        p_customer_name: r["name"] || null,
        p_customer_email: r["email"] || null,
        p_ordered_at: r["date"] ? new Date(r["date"]).toISOString() : new Date().toISOString(),
        p_items: items,
        p_paym_code: PAYMENT_CODES[(r["payment"] || "other").toLowerCase()] ?? 5,
        p_pos_n: r["pos_n"] || null,
        p_trans_n: r["rrn"] || null,
        p_proc_id: r["processor_eik"] || null,
      });
      if (error) fail++;
      else ok++;
    }
    setMsg(t(`Импортирани: ${ok}. Грешки: ${fail}.`, `Imported: ${ok}. Errors: ${fail}.`));
    reload();
  }

  function template() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + CSV_TEMPLATE], { type: "text/csv" }));
    a.download = "primeren-fail-porachki.csv";
    a.click();
  }

  async function testOrder() {
    const price = +(10 + Math.random() * 60).toFixed(2);
    const { error } = await sb.rpc("ingest_order", {
      p_api_key: store.api_key,
      p_external_id: String(Date.now()).slice(-8),
      p_total: +((price * 2 + price / 2) * 1.2).toFixed(2),
      p_customer_email: testEmail.trim() || "test@example.com",
      p_items: [{ name: t("Тестов артикул 1", "Test item 1"), quantity: 2, price }, { name: t("Тестов артикул 2", "Test item 2"), quantity: 1, price: +(price / 2).toFixed(2) }],
    });
    setMsg(error ? t("Грешка при записа.", "Error while saving.") : t(`Тестовата поръчка е записана${testEmail ? ` за ${testEmail}` : ""}.`, `The test order was saved${testEmail ? ` for ${testEmail}` : ""}.`));
    reload();
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="card space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <input ref={file} type="file" accept=".csv" hidden onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} />
            <button className="btn" onClick={() => file.current?.click()}>{t("Импорт от CSV", "Import from CSV")}</button>
            <button className="btn btn-ghost" onClick={template}>{t("Свали примерен CSV", "Download sample CSV")}</button>
            <button className="btn btn-ghost" onClick={() => setManual((v) => !v)}>{t("+ Нова поръчка", "+ New order")}</button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder={t("Имейл за тестова бележка (по избор)", "Email for a test receipt (optional)")}
              className="input !w-72"
            />
            <button className="btn btn-ghost" onClick={testOrder}>{t("Тестова поръчка", "Test order")}</button>
            {msg && <span className="text-sm text-muted">{msg}</span>}
          </div>
          {manual && (
            <ManualOrder store={store} onMsg={setMsg} onDone={() => { setManual(false); reload(); }} />
          )}
        </div>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr><th>№</th><th>{t("Дата", "Date")}</th><th>{t("Клиент", "Customer")}</th><th>{t("Артикули", "Items")}</th><th>{t("Плащане", "Payment")}</th><th className="text-right">{t("Сума", "Total")}</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="py-2">{o.external_id}</td>
                <td>{o.ordered_at.slice(0, 10)}</td>
                <td>{o.customer_email ?? "—"}</td>
                <td className="max-w-[16rem] truncate text-muted" title={o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}>
                  {o.items.length ? o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ") : "—"}
                </td>
                <td>{o.payment_method}</td>
                <td className="text-right">{o.total} {o.currency}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted">{t("Още няма поръчки", "No orders yet")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
