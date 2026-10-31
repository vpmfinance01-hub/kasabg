"use client";
import { Fragment, useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store } from "@/lib/types";
import ReceiptView, { type ReceiptOrder } from "./ReceiptView";
import { useT } from "@/components/LangProvider";
import type { T } from "@/lib/i18n";

type Row = {
  id: string;
  number: number;
  status: string;
  sent_at: string | null;
  created_at: string;
  orders: ReceiptOrder | null;
};

const labelOf = (t: T): Record<string, string> => ({
  pending: t("⏳ Чака изпращане", "⏳ Waiting to send"),
  sent: t("✅ Изпратена", "✅ Sent"),
  no_email: t("⚠️ Няма имейл", "⚠️ No email"),
  failed: t("❌ Не е изпратена", "❌ Not sent"),
  blocked: t("⏸ Чака избор на план", "⏸ Waiting for a plan"),
});

export default function Receipts({ store, readOnly }: { store: Store; readOnly: boolean }) {
  const t = useT();
  const label = labelOf(t);
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await sb
      .from("receipts")
      .select("id,number,status,sent_at,created_at,orders(external_id,customer_email,customer_name,total,currency,items,discount,paym_code,ordered_at)")
      .eq("store_id", store.id)
      .order("number", { ascending: false })
      .limit(300);
    setRows((data as unknown as Row[]) ?? []);
  }, [sb, store.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function resend(id: string) {
    setBusy(id);
    await sb.rpc("resend_receipt", { p_receipt_id: id });
    // n8n отбелязва бележката като изпратена след няколко секунди
    setTimeout(() => {
      load();
      setBusy(null);
    }, 5000);
  }

  async function resendFailed() {
    setBusy("all");
    for (const r of rows.filter((x) => x.status === "failed")) await sb.rpc("resend_receipt", { p_receipt_id: r.id });
    setTimeout(() => {
      load();
      setBusy(null);
    }, 6000);
  }

  const pending = rows.filter((r) => r.status === "pending").length;
  const failed = rows.filter((r) => r.status === "failed").length;

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted">
          {t("Всички:", "All:")} <b>{rows.length}</b> · {t("изпратени:", "sent:")} <b>{rows.filter((r) => r.status === "sent").length}</b> · {t("чакат:", "waiting:")} <b>{pending}</b>{failed > 0 && <> · {t("неизпратени:", "not sent:")} <b>{failed}</b></>}
        </div>
        <button className="btn btn-ghost !py-1.5 text-sm" onClick={load}>{t("Обнови", "Refresh")}</button>
      </div>
      {failed > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-900">
          <span>
            {failed} {failed === 1 ? t("бележка не е изпратена", "receipt was not sent") : t("бележки не са изпратени", "receipts were not sent")} {t("след няколко опита. Най-често паролата на фирмената поща е грешна или е блокирана. Проверете „Настройки → Имейл на магазина“, после натиснете „Изпрати отново“.", "after several attempts. Most often the company mailbox password is wrong or blocked. Check “Settings → Shop email”, then press “Send again”.")}
          </span>
          {!readOnly && (
            <button className="btn !py-1.5 text-sm" disabled={busy === "all"} onClick={resendFailed}>
              {busy === "all" ? "…" : t("Изпрати всички отново", "Send all again")}
            </button>
          )}
        </div>
      )}
      {pending > 0 && (
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          {t("Има бележки, които чакат. Системата опитва автоматично няколко пъти. Ако стоят така дълго, опитайте „Изпрати отново“.", "Some receipts are waiting. The system retries automatically a few times. If they stay like this for long, try “Send again”.")}
        </div>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr><th>№</th><th>{t("Поръчка", "Order")}</th><th>{t("Клиент", "Customer")}</th><th>{t("Артикули", "Items")}</th><th>{t("Сума", "Total")}</th><th>{t("Статус", "Status")}</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const items = r.orders?.items ?? [];
              const isOpen = open === r.id;
              return (
                <Fragment key={r.id}>
                  <tr className="border-t border-line">
                    <td className="py-2">{r.number}</td>
                    <td>{r.orders?.external_id}</td>
                    <td>{r.orders?.customer_email ?? "—"}</td>
                    <td className="max-w-[16rem] truncate text-muted" title={items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}>
                      {items.length ? items.map((i) => `${i.name} ×${i.quantity}`).join(", ") : "—"}
                    </td>
                    <td>{r.orders ? `${r.orders.total} ${r.orders.currency}` : ""}</td>
                    <td>{label[r.status] ?? r.status}{r.sent_at ? ` · ${r.sent_at.slice(0, 16).replace("T", " ")}` : ""}</td>
                    <td className="space-x-3 whitespace-nowrap">
                      <button className="text-brand-dark" onClick={() => setOpen(isOpen ? null : r.id)}>{isOpen ? t("Скрий", "Hide") : t("Виж бележката", "View receipt")}</button>
                      {!readOnly && r.status !== "no_email" && (
                        <button className="text-brand-dark disabled:opacity-50" disabled={busy === r.id} onClick={() => resend(r.id)}>
                          {busy === r.id ? "…" : t("Изпрати отново", "Send again")}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isOpen && r.orders && (
                    <tr className="bg-accent/30">
                      <td colSpan={7} className="px-2 py-4">
                        <ReceiptView store={store} number={r.number} order={r.orders} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-muted">{t("Още няма бележки", "No receipts yet")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
