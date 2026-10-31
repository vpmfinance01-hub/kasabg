"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { PAID_PLANS, PLANS, STATUS_LABEL, STATUS_LABEL_EN, YEARLY_DISCOUNT, type PlanKey } from "@/lib/plans";
import { useLang, useT } from "@/components/LangProvider";
import type { Store } from "@/lib/types";

/** План, използване и плащане. */
export default function Billing({ store }: { store: Store }) {
  const t = useT();
  const en = useLang() === "en";
  const sb = supabaseBrowser();
  const [used, setUsed] = useState<number | null>(null);
  const [yearly, setYearly] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    sb.from("orders").select("id", { count: "exact", head: true }).eq("store_id", store.id).gte("ordered_at", start.toISOString())
      .then(({ count }) => setUsed(count ?? 0));
  }, [sb, store.id]);

  const plan = PLANS[store.plan as PlanKey] ?? PLANS.starter;
  const limit = plan.orders;
  const over = limit !== null && used !== null && used > limit;
  const paid = store.subscription_status === "active" || store.subscription_status === "past_due";

  async function go(body: Record<string, unknown>, key: string) {
    setBusy(key);
    setMsg("");
    const { data } = await sb.auth.getSession();
    const r = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify({ store_id: store.id, ...body }),
    });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; url?: string; message?: string };
    setBusy(null);
    if (j.ok && j.url) window.location.assign(j.url);
    else setMsg(j.message ?? t("Грешка. Опитайте пак.", "Error. Please try again."));
  }

  return (
    <div className="card">
      <h3 className="font-bold">{t("План и плащане", "Plan and payment")}</h3>
      <div className="mt-2 text-sm">
        <b>{plan.name}</b> · {(en ? STATUS_LABEL_EN : STATUS_LABEL)[store.subscription_status] ?? store.subscription_status}
        {store.subscription_status === "trial" && t(` · пробният период свършва на ${store.trial_ends_at.slice(0, 10)}`, ` · the trial ends on ${store.trial_ends_at.slice(0, 10)}`)}
        {store.current_period_end && paid && t(` · следващо подновяване ${store.current_period_end.slice(0, 10)}`, ` · next renewal ${store.current_period_end.slice(0, 10)}`)}
      </div>
      {used !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted">
            <span>{t("Поръчки този месец", "Orders this month")}</span>
            <span>{used}{limit ? ` / ${limit}` : ""}</span>
          </div>
          {limit && (
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-accent">
              <div className={`h-full ${over ? "bg-red-500" : "bg-brand"}`} style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} />
            </div>
          )}
          {over && <p className="mt-2 text-sm text-red-700">{t("Надхвърлихте лимита на плана. Бележките продължават да се изпращат, но изберете по-голям план.", "You have exceeded the plan limit. Receipts keep being sent, but choose a bigger plan.")}</p>}
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 text-sm">
        <button className={`btn !py-1 text-xs ${yearly ? "btn-ghost" : ""}`} onClick={() => setYearly(false)}>{t("Месечно", "Monthly")}</button>
        <button className={`btn !py-1 text-xs ${yearly ? "" : "btn-ghost"}`} onClick={() => setYearly(true)}>{t("Годишно", "Yearly")} −{Math.round(YEARLY_DISCOUNT * 100)}%</button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {PAID_PLANS.map((k) => {
          const p = PLANS[k];
          const price = p.price! * (yearly ? 1 - YEARLY_DISCOUNT : 1);
          const current = store.plan === k && paid;
          return (
            <div key={k} className={`rounded-xl border p-4 text-center ${current ? "border-brand bg-accent" : "border-line"}`}>
              <div className="font-bold">{p.name}</div>
              <div className="mt-1 text-2xl font-extrabold text-brand">{Math.round(price)} €</div>
              <div className="text-xs text-muted">{t("на месец, без ДДС", "per month, excl. VAT")}</div>
              <div className="mt-2 text-sm">{en ? p.blurbEn : p.blurb}</div>
              <button className="btn mt-3 w-full text-sm" disabled={current || busy !== null} onClick={() => go({ plan: k, interval: yearly ? "year" : "month" }, k)}>
                {current ? t("Текущ план", "Current plan") : busy === k ? "…" : paid ? t("Смени", "Change") : t("Избери", "Choose")}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        {paid && <button className="btn btn-ghost" disabled={busy !== null} onClick={() => go({ portal: true }, "portal")}>{t("Фактури и карта", "Invoices and card")}</button>}
        <span className="text-xs text-muted">{t("Над 10 000 поръчки?", "Over 10,000 orders?")} <a className="text-brand-dark" href="/contact">{t("Свържете се с нас", "Get in touch")}</a>.</span>
      </div>
      {msg && <p className="mt-3 text-sm text-red-700">{msg}</p>}
    </div>
  );
}
