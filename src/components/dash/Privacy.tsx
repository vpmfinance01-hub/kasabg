"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store } from "@/lib/types";
import { useT } from "@/components/LangProvider";

/** Лични данни: изтегляне, заличаване на клиент, изтриване на магазина. */
export default function Privacy({ store, onDeleted }: { store: Store; onDeleted: () => void }) {
  const t = useT();
  const sb = supabaseBrowser();
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const [busy, setBusy] = useState(false);

  async function exportAll() {
    setBusy(true);
    setMsg("");
    const [orders, receipts, refunds] = await Promise.all([
      sb.from("orders").select("*").eq("store_id", store.id).order("ordered_at"),
      sb.from("receipts").select("id,number,status,sent_at,created_at,order_id").eq("store_id", store.id).order("number"),
      sb.from("refunds").select("*").eq("store_id", store.id).order("refunded_at"),
    ]);
    const { api_key: _omit, ...shop } = store; // ключът не се записва във файл
    void _omit;
    const out = { exported_at: new Date().toISOString(), store: shop, orders: orders.data ?? [], receipts: receipts.data ?? [], refunds: refunds.data ?? [] };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: "application/json" }));
    a.download = `kasabg-danni-${new Date().toLocaleDateString("sv-SE")}.json`;
    a.click();
    setBusy(false);
    setMsg(t("Файлът е свален.", "The file was downloaded."));
  }

  async function forget(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(t(`Да се заличат името и имейлът на ${email} от всички поръчки? Това не може да се върне.`, `Erase the name and email of ${email} from all orders? This cannot be undone.`))) return;
    const { data, error } = await sb.rpc("anonymize_customer", { p_store: store.id, p_email: email });
    setMsg(
      error
        ? t("Грешка: ", "Error: ") + error.message
        : t(`Заличени данни в ${data} ${data === 1 ? "поръчка" : "поръчки"}. Сумите и бележките остават.`, `Data erased in ${data} ${data === 1 ? "order" : "orders"}. Amounts and receipts remain.`)
    );
    if (!error) setEmail("");
  }

  async function removeStore(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const files = await sb.storage.from("logos").list(store.id);
    if (files.data?.length) await sb.storage.from("logos").remove(files.data.map((f) => `${store.id}/${f.name}`));
    const { error } = await sb.rpc("delete_store", { p_store: store.id, p_confirm_name: confirmName });
    setBusy(false);
    if (error) return setMsg(error.message.includes("mismatch") ? t("Името не съвпада.", "The name does not match.") : t("Грешка: ", "Error: ") + error.message);
    onDeleted();
  }

  return (
    <div className="card space-y-5">
      <div>
        <h3 className="font-bold">{t("Лични данни", "Personal data")}</h3>
        <p className="mt-1 text-sm text-muted">
          {t(
            "Вие сте администратор на данните на клиентите си, а КасаБГ ги обработва за вас. Счетоводните документи се пазат по закон, затова при искане за изтриване от клиент заличаваме само името и имейла, не сумите.",
            "You are the controller of your customers' data and KasaBG processes it for you. Accounting documents are kept by law, so when a customer asks for deletion we erase only the name and email, not the amounts."
          )}
        </p>
      </div>

      <div>
        <div className="text-sm font-medium">{t("Изтегляне на всички данни на магазина", "Download all of the shop's data")}</div>
        <button className="btn btn-ghost mt-2" disabled={busy} onClick={exportAll}>{t("Свали (JSON)", "Download (JSON)")}</button>
      </div>

      <form onSubmit={forget}>
        <div className="text-sm font-medium">{t("Клиент поиска да изтриете данните му", "A customer asked you to delete their data")}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("Имейл на клиента", "Customer email")} className="input !w-72" />
          <button className="btn btn-ghost">{t("Заличи името и имейла", "Erase name and email")}</button>
        </div>
      </form>

      <form onSubmit={removeStore} className="rounded-xl border border-red-200 p-4">
        <div className="text-sm font-medium text-red-800">{t("Изтриване на магазина", "Delete the shop")}</div>
        <p className="mt-1 text-xs text-muted">
          {t(
            "Изтрива поръчките, бележките, възстановените суми и настройките безвъзвратно. Първо свалете данните и одиторските файлове. За да потвърдите, напишете името:",
            "Deletes the orders, receipts, refunds and settings permanently. Download the data and the audit files first. To confirm, type the name:"
          )}{" "}
          <b>{store.name}</b>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <input required value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={t("Име на магазина", "Shop name")} className="input !w-72" />
          <button className="btn !bg-red-700" disabled={busy || confirmName !== store.name}>{t("Изтрий магазина", "Delete the shop")}</button>
        </div>
      </form>
      {msg && <p className="text-sm text-muted">{msg}</p>}
    </div>
  );
}
