"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store, Refund } from "@/lib/types";
import { useT } from "@/components/LangProvider";
import type { T } from "@/lib/i18n";

const methodsOf = (t: T): Record<number, string> => ({ 1: "IBAN", 2: t("Карта", "Card"), 3: t("В брой", "Cash"), 4: t("Друго", "Other") });

const labelOf = (t: T): Record<string, string> => ({
  pending: t("⏳ Чака изпращане", "⏳ Waiting to send"),
  sent: t("✅ Изпратено", "✅ Sent"),
  no_email: t("⚠️ Няма имейл", "⚠️ No email"),
  failed: t("❌ Не е изпратено", "❌ Not sent"),
  blocked: t("⏸ Чака избор на план", "⏸ Waiting for a plan"),
  old: "—",
});

export default function Refunds({ store, refunds, reload, readOnly }: { store: Store; refunds: Refund[]; reload: () => void; readOnly: boolean }) {
  const t = useT();
  const label = labelOf(t);
  const methods = methodsOf(t);
  const sb = supabaseBrowser();
  const [busy, setBusy] = useState<string | null>(null);

  async function resend(id: string) {
    setBusy(id);
    await sb.rpc("resend_credit", { p_refund_id: id });
    setTimeout(() => {
      reload();
      setBusy(null);
    }, 6000);
  }

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    await sb.from("refunds").insert({
      store_id: store.id,
      order_ref: f.get("ref"),
      amount: Number(f.get("amount")),
      refunded_at: f.get("date"),
      method_code: Number(f.get("method")),
    });
    form.reset();
    reload();
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <form onSubmit={add} className="card grid gap-3 md:grid-cols-5">
          <input name="ref" required placeholder={t("№ на поръчка", "Order no.")} className="input" />
          <input name="amount" required type="number" step="0.01" min="0.01" placeholder={t("Сума", "Amount")} className="input" />
          <input name="date" required type="date" defaultValue={new Date().toLocaleDateString("sv-SE")} className="input" />
          <select name="method" className="input">
            {Object.entries(methods).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="btn">{t("Добави възстановена сума", "Add a refund")}</button>
        </form>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr><th>{t("Кред. известие", "Credit note")}</th><th>{t("Поръчка", "Order")}</th><th>{t("Дата", "Date")}</th><th>{t("Метод", "Method")}</th><th className="text-right">{t("Сума", "Amount")}</th><th className="pl-4">{t("Известие до клиента", "Notice to the customer")}</th><th></th></tr>
          </thead>
          <tbody>
            {refunds.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="py-2">{r.number ?? "—"}</td>
                <td>{r.order_ref}</td>
                <td>{r.refunded_at}</td>
                <td>{methods[r.method_code]}</td>
                <td className="text-right">{r.amount}</td>
                <td className="pl-4">{label[r.status] ?? r.status}{r.sent_at ? ` · ${r.sent_at.slice(0, 16).replace("T", " ")}` : ""}</td>
                <td className="whitespace-nowrap pl-3">
                  {!readOnly && (r.status === "failed" || r.status === "sent" || r.status === "pending") && (
                    <button className="text-brand-dark disabled:opacity-50" disabled={busy === r.id} onClick={() => resend(r.id)}>
                      {busy === r.id ? "…" : t("Изпрати отново", "Send again")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {refunds.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-muted">{t("Няма възстановени суми", "No refunds")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
