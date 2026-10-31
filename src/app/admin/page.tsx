"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Row = {
  store_id: string; store_name: string; owner_email: string; plan: string; trial_ends_at: string;
  created_at: string; orders_total: number; orders_prev_month: number;
  receipts_pending: number; receipts_sent: number; prev_month_status: string; has_nap_number: boolean;
};
type Lead = { id: string; name: string | null; email: string; message: string | null; created_at: string };

const statusLabel: Record<string, string> = { none: "⏳ не е свален", downloaded: "📄 свален", submitted: "✅ подаден" };

export default function Admin() {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [rows, setRows] = useState<Row[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tab, setTab] = useState<"clients" | "leads">("clients");
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return router.replace("/login");
    const [o, l] = await Promise.all([sb.rpc("admin_overview"), sb.rpc("admin_leads")]);
    if (o.error) return setState("denied");
    setRows((o.data as Row[]) ?? []);
    setLeads((l.data as Lead[]) ?? []);
    setState("ok");
  }, [sb, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function update(r: Row, plan: string, days: number) {
    const ends = days === 0
      ? r.trial_ends_at
      : new Date(Math.max(now, new Date(r.trial_ends_at).getTime()) + days * 86400000).toISOString();
    await sb.rpc("admin_update_store", { p_store: r.store_id, p_plan: plan, p_trial_ends: ends });
    load();
  }

  if (state === "loading") return <div className="p-10 text-center text-muted">Зареждане…</div>;
  if (state === "denied")
    return (
      <div className="card mx-auto mt-24 max-w-md space-y-3 text-center">
        <p>Нямате достъп до тази страница.</p>
        <Link href="/app" className="btn inline-block">Към таблото</Link>
      </div>
    );

  const pendingFiles = rows.filter((r) => r.prev_month_status !== "submitted").length;
  const expired = rows.filter((r) => new Date(r.trial_ends_at).getTime() < now).length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-brand-dark">☀ КасаБГ · Админ</Link>
        <Link href="/app" className="font-semibold text-brand-dark">Към таблото</Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="card"><div className="text-sm text-muted">Магазини</div><div className="text-3xl font-extrabold">{rows.length}</div></div>
        <div className="card"><div className="text-sm text-muted">Поръчки общо</div><div className="text-3xl font-extrabold">{rows.reduce((s, r) => s + Number(r.orders_total), 0)}</div></div>
        <div className="card"><div className="text-sm text-muted">Неподадени за миналия месец</div><div className="text-3xl font-extrabold">{pendingFiles}</div></div>
        <div className="card"><div className="text-sm text-muted">Изтекъл пробен период</div><div className="text-3xl font-extrabold">{expired}</div></div>
      </div>

      <div className="mt-6 flex gap-1 border-b border-line">
        {([["clients", "Клиенти"], ["leads", `Запитвания (${leads.length})`]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-semibold ${tab === k ? "border-b-2 border-brand text-brand-dark" : "text-muted"}`}>{l}</button>
        ))}
      </div>

      {tab === "clients" && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr><th>Магазин</th><th>Собственик</th><th>План</th><th>Пробен до</th><th>Поръчки</th><th>Миналия месец</th><th>Бележки</th><th>Файл</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.store_id} className="border-t border-line align-top">
                  <td className="py-2 font-semibold">{r.store_name}{!r.has_nap_number && <div className="text-xs text-amber-700">без № от НАП</div>}</td>
                  <td>{r.owner_email}</td>
                  <td className="capitalize">{r.plan}</td>
                  <td className={new Date(r.trial_ends_at).getTime() < now ? "text-red-700" : ""}>{r.trial_ends_at.slice(0, 10)}</td>
                  <td>{r.orders_total}</td>
                  <td>{r.orders_prev_month}</td>
                  <td>{r.receipts_sent} ✔ / {r.receipts_pending} ⏳</td>
                  <td>{statusLabel[r.prev_month_status] ?? r.prev_month_status}</td>
                  <td className="space-x-1 whitespace-nowrap">
                    <button className="text-brand-dark" onClick={() => update(r, r.plan, 14)}>+14 дни</button>
                    <select value={r.plan} onChange={(e) => update(r, e.target.value, 0)} className="rounded border border-line bg-white px-1 py-0.5">
                      {["starter", "essential", "premium", "enterprise"].map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={9} className="py-6 text-center text-muted">Още няма клиенти</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "leads" && (
        <div className="mt-6 space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="card">
              <div className="flex justify-between text-sm">
                <b>{l.name || "—"} · {l.email}</b>
                <span className="text-muted">{l.created_at.slice(0, 10)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{l.message}</p>
            </div>
          ))}
          {leads.length === 0 && <div className="card text-center text-muted">Няма запитвания</div>}
        </div>
      )}
    </div>
  );
}
