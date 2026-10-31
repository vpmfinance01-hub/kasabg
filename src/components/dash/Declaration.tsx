"use client";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  DECLARATION_VERSION, confirmations, emptyAnswers, paymentOptions, validate, warnings,
  type Answers,
} from "@/lib/declaration";
import type { Store } from "@/lib/types";
import { useLang, useT } from "@/components/LangProvider";
import type { T } from "@/lib/i18n";

type Saved = { id: string; version: number; accepted_at: string; accepted_email: string | null; answers_hash: string; answers: Answers & { warnings?: string[] } };

const yesNoNa = (t: T) => ({ yes: t("Да", "Yes"), no: t("Не", "No"), na: t("Не приемам карти", "I do not accept cards") });

function Radio<K extends string>({ name, value, options, onChange }: { name: string; value: K | ""; options: Record<string, string>; onChange: (v: K) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
      {Object.entries(options).map(([k, l]) => (
        <label key={k} className="flex items-center gap-2">
          <input type="radio" name={name} checked={value === k} onChange={() => onChange(k as K)} /> {l}
        </label>
      ))}
    </div>
  );
}

/** Декларация на магазина: въпроси при регистрация, записват се неизменно с дата, потребител и IP. */
export default function Declaration({ store }: { store: Store }) {
  const t = useT();
  const lang = useLang();
  const sb = supabaseBrowser();
  const [saved, setSaved] = useState<Saved | null | undefined>(undefined);
  const [a, setA] = useState<Answers>(emptyAnswers);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [renew, setRenew] = useState(false);

  const load = useCallback(async () => {
    const { data } = await sb
      .from("store_declarations")
      .select("id,version,accepted_at,accepted_email,answers_hash,answers")
      .eq("store_id", store.id)
      .order("accepted_at", { ascending: false })
      .limit(1);
    setSaved(((data ?? [])[0] as Saved | undefined) ?? null);
  }, [sb, store.id]);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((p) => ({ ...p, [k]: v }));
  const card = a.payments.includes("card_vpos") || a.payments.includes("payment_service");
  const w = warnings(a, t);
  const pays = paymentOptions(t);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(a, t);
    setErrors(errs);
    if (errs.length) return;
    setBusy(true);
    const { data } = await sb.auth.getSession();
    const r = await fetch("/api/declaration", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
      body: JSON.stringify({ store_id: store.id, version: DECLARATION_VERSION, answers: a, lang }),
    });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    setBusy(false);
    if (!j.ok) return setErrors([j.message ?? t("Грешка. Опитайте пак.", "Error. Please try again.")]);
    setRenew(false);
    setA(emptyAnswers());
    load();
  }

  if (saved === undefined) return null;

  const current = saved && saved.version === DECLARATION_VERSION;
  if (current && !renew) {
    const payLabels = pays.filter(([k]) => saved.answers.payments.includes(k)).map(([, l]) => l);
    return (
      <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>{t("✅ Декларацията е приета на", "✅ The declaration was accepted on")} {saved.accepted_at.slice(0, 10)} {t("от", "by")} {saved.accepted_email}</span>
          <span className="space-x-3">
            <button className="font-semibold" onClick={() => setOpen((v) => !v)}>{open ? t("Скрий", "Hide") : t("Виж", "View")}</button>
            <button className="font-semibold" onClick={() => setRenew(true)}>{t("Обнови", "Renew")}</button>
          </span>
        </div>
        {open && (
          <div className="mt-3 space-y-1 text-xs">
            <div>{t("Плащания:", "Payments:")} {payLabels.join(", ")}</div>
            <div>{t("Регистриран в НАП:", "Registered with the NRA:")} {saved.answers.nap_registered === "yes" ? `${t("да", "yes")} (${saved.answers.nap_number})` : saved.answers.nap_registered === "pending" ? t("в процес", "in progress") : t("не", "no")}</div>
            {(saved.answers.warnings ?? []).map((x) => <div key={x}>⚠️ {x}</div>)}
            <div className="text-green-800/70">{t("Версия", "Version")} {saved.version} · {t("отпечатък", "fingerprint")} {saved.answers_hash.slice(0, 16)}… {t("Записът не може да се променя. При промяна подайте нова декларация.", "The record cannot be changed. To change it, submit a new declaration.")}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card mt-4 space-y-5">
      <div>
        <h2 className="text-xl font-bold">{saved ? t("Нова декларация", "New declaration") : t("Преди да започнете: няколко въпроса за магазина", "Before you start: a few questions about the shop")}</h2>
        <p className="mt-1 text-sm text-muted">
          {t("Отговорите се записват с дата, час, потребител и IP адрес и не могат да се променят. Така и вие, и ние знаем на какво основание работи магазинът. При промяна на обстоятелствата подайте нова декларация.", "Your answers are recorded with the date, time, user and IP address and cannot be changed. That way both you and we know on what basis the shop operates. If circumstances change, submit a new declaration.")}
        </p>
      </div>

      <div>
        <div className="font-medium">{t("1. Регистриран ли е магазинът в НАП като електронен магазин?", "1. Is the shop registered with the NRA as an e-shop?")}</div>
        <Radio name="nap" value={a.nap_registered} options={{ yes: t("Да", "Yes"), pending: t("В процес на регистрация", "Registration in progress"), no: t("Не", "No") }} onChange={(v) => set("nap_registered", v)} />
        {a.nap_registered === "yes" && <input className="input mt-2 !w-72" placeholder={t("№ на магазина от НАП", "Shop number from the NRA")} value={a.nap_number} onChange={(e) => set("nap_number", e.target.value)} />}
      </div>

      <div>
        <div className="font-medium">{t("2. Какви начини на плащане предлага магазинът?", "2. Which payment methods does the shop offer?")}</div>
        <div className="mt-2 grid gap-1 text-sm md:grid-cols-2">
          {pays.map(([k, l]) => (
            <label key={k} className="flex items-center gap-2">
              <input type="checkbox" checked={a.payments.includes(k)} onChange={(e) => set("payments", e.target.checked ? [...a.payments, k] : a.payments.filter((x) => x !== k))} /> {l}
            </label>
          ))}
        </div>
      </div>

      {card && (
        <div>
          <div className="font-medium">{t("3. Картовите плащания постъпват ли само в платежна сметка на фирмата?", "3. Do card payments go only into the company's own payment account?")}</div>
          <Radio name="acc" value={a.card_account_own} options={yesNoNa(t)} onChange={(v) => set("card_account_own", v)} />
          <input className="input mt-2 !w-72" placeholder={t("Доставчик (банка или платежна услуга)", "Provider (bank or payment service)")} value={a.payment_provider} onChange={(e) => set("payment_provider", e.target.value)} />
        </div>
      )}

      <div>
        <div className="font-medium">{t("4. Регистрирана ли е фирмата по ЗДДС?", "4. Is the company registered for VAT?")}</div>
        <Radio name="vat" value={a.vat_registered} options={{ yes: t("Да", "Yes"), no: t("Не", "No") }} onChange={(v) => set("vat_registered", v)} />
        {a.vat_registered === "yes" && <input className="input mt-2 !w-72" placeholder={t("ЗДДС номер", "VAT number")} value={a.vat_number} onChange={(e) => set("vat_number", e.target.value)} />}
      </div>

      <div>
        <div className="font-medium">{t("5. Отчитат ли се част от продажбите по друг начин (касов апарат, друг софтуер, фактури)?", "5. Are some sales reported another way (cash register, other software, invoices)?")}</div>
        <Radio name="oth" value={a.other_system} options={{ no: t("Не, всички минават през КасаБГ", "No, all of them go through KasaBG"), yes: t("Да", "Yes") }} onChange={(v) => set("other_system", v)} />
        {a.other_system === "yes" && <input className="input mt-2" placeholder={t("Кратко описание", "Short description")} value={a.other_system_note} onChange={(e) => set("other_system_note", e.target.value)} />}
      </div>

      <div>
        <div className="font-medium">{t("6. Обсъдили ли сте ползването на алтернативния режим със счетоводител?", "6. Have you discussed using the alternative regime with an accountant?")}</div>
        <Radio name="acct" value={a.accountant_consulted} options={{ yes: t("Да", "Yes"), no: t("Не", "No") }} onChange={(v) => set("accountant_consulted", v)} />
      </div>

      {w.length > 0 && (
        <div className="space-y-2">
          {w.map((x) => (
            <div key={x.text} className={`rounded-xl p-3 text-sm ${x.level === "error" ? "bg-red-50 text-red-900" : "bg-amber-50 text-amber-900"}`}>
              {x.level === "error" ? "⛔" : "⚠️"} {x.text}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 rounded-xl bg-accent p-4">
        <div className="font-medium">{t("Потвърждения", "Confirmations")}</div>
        {confirmations(t).map(([k, text]) => (
          <label key={k} className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={a[k] as boolean} onChange={(e) => set(k, e.target.checked as never)} /> <span>{text}</span>
          </label>
        ))}
        {lang === "en" && <p className="text-xs text-muted">The Bulgarian text of this declaration is the one that applies; the English is for your convenience.</p>}
      </div>

      {errors.length > 0 && (
        <ul className="list-disc space-y-1 rounded-xl bg-red-50 p-3 pl-7 text-sm text-red-900">
          {errors.map((x) => <li key={x}>{x}</li>)}
        </ul>
      )}
      <div className="flex gap-2">
        <button className="btn" disabled={busy}>{busy ? t("Записва се…", "Saving…") : t("Приемам и записвам", "I accept and save")}</button>
        {saved && <button type="button" className="btn btn-ghost" onClick={() => setRenew(false)}>{t("Отказ", "Cancel")}</button>}
      </div>
    </form>
  );
}
