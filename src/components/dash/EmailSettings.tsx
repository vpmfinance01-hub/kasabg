"use client";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store } from "@/lib/types";
import { useT } from "@/components/LangProvider";
import type { T } from "@/lib/i18n";

type Cfg = {
  from_name: string; from_email: string; smtp_host: string; smtp_port: number; smtp_secure: boolean;
  smtp_user: string; has_password: boolean; verified_at: string | null; last_error: string | null;
};

const presets: Record<string, { host: string; port: number; secure: boolean }> = {
  Gmail: { host: "smtp.gmail.com", port: 465, secure: true },
  "Microsoft 365": { host: "smtp.office365.com", port: 587, secure: false },
  "Друг доставчик": { host: "", port: 465, secure: true },
};
const presetName = (n: string, t: T) => (n === "Друг доставчик" ? t("Друг доставчик", "Other provider") : n);
const presetHint = (n: string, t: T) =>
  n === "Microsoft 365"
    ? t("Нужно е SMTP изпращане да е разрешено за пощенската кутия от администратора на Microsoft 365.", "SMTP sending must be enabled for the mailbox by your Microsoft 365 administrator.")
    : n === "Друг доставчик"
      ? t("Данните за SMTP ги дава доставчикът на пощата ви (хостинг, домейн).", "Your mail provider (hosting, domain) gives you the SMTP details.")
      : "";

export default function EmailSettings({ store }: { store: Store }) {
  const t = useT();
  const sb = supabaseBrowser();
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [preset, setPreset] = useState("Gmail");
  const [form, setForm] = useState({ from_name: store.name, from_email: "", host: "smtp.gmail.com", port: 465, secure: true, user: "", password: "" });

  const load = useCallback(async () => {
    const { data } = await sb.rpc("get_store_email", { p_store: store.id });
    const c = data as Cfg | null;
    setCfg(c);
    if (c) setForm({ from_name: c.from_name, from_email: c.from_email, host: c.smtp_host, port: c.smtp_port, secure: c.smtp_secure, user: c.smtp_user, password: "" });
    setLoaded(true);
  }, [sb, store.id]);
  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  function pick(name: string) {
    setPreset(name);
    const p = presets[name];
    setForm((f) => ({ ...f, host: p.host, port: p.port, secure: p.secure }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await sb.rpc("save_store_email", {
      p_store: store.id, p_from_name: form.from_name, p_from_email: form.from_email.trim(), p_host: form.host.trim(),
      p_port: Number(form.port), p_secure: form.secure, p_user: (form.user || form.from_email).trim(),
      // паролата за приложение на Google се показва с интервали: махаме ги
      p_password: form.password ? (preset === "Gmail" ? form.password.replace(/\s+/g, "") : form.password) : null,
    });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: t("Неуспешен запис. Проверете полетата.", "Could not save. Check the fields.") });
    setMsg({ ok: true, text: t("Запазено. Натиснете „Изпрати тестов имейл“, за да се провери.", "Saved. Press “Send test email” to check it.") });
    load();
  }

  async function test() {
    setBusy(true);
    setMsg(null);
    const { data: s } = await sb.auth.getSession();
    const r = await fetch("/api/test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.session?.access_token ?? ""}` },
      body: JSON.stringify({ store_id: store.id }),
    }).then((x) => x.json()).catch(() => ({ ok: false, message: t("Няма връзка със сървъра.", "No connection to the server.") }));
    setBusy(false);
    setMsg({ ok: !!r.ok, text: r.message });
    load();
  }

  async function remove() {
    if (!confirm(t("Да се премахне ли пощата на магазина? Бележките ще се пращат от адреса на платформата.", "Remove the shop mailbox? Receipts will be sent from the platform address."))) return;
    await sb.rpc("delete_store_email", { p_store: store.id });
    setForm({ from_name: store.name, from_email: "", host: "smtp.gmail.com", port: 465, secure: true, user: "", password: "" });
    setMsg(null);
    load();
  }

  const status = !cfg
    ? { cls: "bg-amber-50 text-amber-900", text: t("Не е настроена. Бележките се пращат от адреса на платформата.", "Not set up. Receipts are sent from the platform address.") }
    : cfg.verified_at
      ? { cls: "bg-green-50 text-green-800", text: t(`✅ Проверена (${cfg.verified_at.slice(0, 10)}). Бележките се пращат от ${cfg.from_email}.`, `✅ Verified (${cfg.verified_at.slice(0, 10)}). Receipts are sent from ${cfg.from_email}.`) }
      : { cls: "bg-amber-50 text-amber-900", text: t("⚠️ Още не е проверена. До проверката бележките се пращат от платформата.", "⚠️ Not verified yet. Until it is, receipts are sent from the platform.") };

  if (!loaded) return null;

  return (
    <div className="card">
      <h3 className="font-bold">{t("Имейл за електронните бележки", "Email for electronic receipts")}</h3>
      <p className="mt-1 text-sm text-muted">
        {t("Бележките към клиентите ще се пращат от фирмения имейл на магазина. Паролата се пази криптирана и никога не се показва отново.", "Receipts to customers will be sent from the shop's company email. The password is stored encrypted and is never shown again.")}
      </p>
      <div className={`mt-3 rounded-xl p-3 text-sm ${status.cls}`}>{status.text}</div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.keys(presets).map((n) => (
          <button key={n} type="button" onClick={() => pick(n)} className={`btn !py-1.5 text-sm ${preset === n ? "" : "btn-ghost"}`}>{presetName(n, t)}</button>
        ))}
      </div>
      {preset !== "Gmail" && <p className="mt-2 text-xs text-muted">{presetHint(preset, t)}</p>}

      <form onSubmit={save} className="mt-3 grid gap-3 md:grid-cols-2">
        <input className="input" required placeholder={t("Име на подателя (напр. Моят магазин)", "Sender name (e.g. My Shop)")} value={form.from_name} onChange={(e) => set("from_name", e.target.value)} />
        <input className="input" required type="email" placeholder={t("Фирмен имейл (office@moy-magazin.bg)", "Company email (office@my-shop.com)")} value={form.from_email} onChange={(e) => set("from_email", e.target.value)} />
        <input className="input" required placeholder={t("SMTP сървър (хост)", "SMTP server (host)")} value={form.host} onChange={(e) => set("host", e.target.value)} />
        <div className="flex gap-2">
          <input className="input" required type="number" min={1} max={65535} placeholder={t("Порт", "Port")} value={form.port} onChange={(e) => set("port", Number(e.target.value))} />
          <label className="flex shrink-0 items-center gap-2 text-sm">
            <input type="checkbox" checked={form.secure} onChange={(e) => set("secure", e.target.checked)} /> SSL
          </label>
        </div>
        <input className="input" placeholder={t("Потребител (обикновено същият имейл)", "Username (usually the same email)")} value={form.user} onChange={(e) => set("user", e.target.value)} />
        <div className="relative">
          <input className={`input ${preset === "Gmail" ? "!pr-10" : ""}`} type="password" autoComplete="new-password" required={!cfg?.has_password}
            placeholder={
              preset === "Gmail"
                ? cfg?.has_password ? t("16 символа (запазени, оставете празно)", "16 characters (saved, leave empty)") : t("16 символа", "16 characters")
                : cfg?.has_password ? t("Парола (запазена, оставете празно)", "Password (saved, leave empty)") : t("Парола", "Password")
            }
            value={form.password} onChange={(e) => set("password", e.target.value)} />
          {preset === "Gmail" && (
            <>
              <button
                type="button"
                aria-label={t("Как да взема 16-те символа от Gmail?", "How do I get the 16 characters from Gmail?")}
                aria-expanded={helpOpen}
                onClick={() => setHelpOpen((v) => !v)}
                className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border border-brand text-xs font-bold leading-none text-brand-dark hover:bg-accent"
              >
                ?
              </button>
              {helpOpen && (
                <div role="dialog" className="absolute right-0 top-9 z-20 w-72 max-w-[85vw] rounded-xl border border-line bg-white p-3 text-xs text-foreground shadow-lg">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <b>{t("Как да взема 16-те символа от Gmail?", "How do I get the 16 characters from Gmail?")}</b>
                    <button type="button" aria-label={t("Затвори", "Close")} onClick={() => setHelpOpen(false)} className="text-muted hover:text-foreground">✕</button>
                  </div>
                  <ol className="list-decimal space-y-1 pl-4 text-muted">
                    <li>{t("Влезте в Google акаунта на фирмената поща и включете „Потвърждаване в 2 стъпки“ (Сигурност).", "Sign in to the Google account of the company mailbox and turn on “2-Step Verification” (Security).")}</li>
                    <li>{t("Отворете", "Open")} <a className="text-brand-dark underline" href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">myaccount.google.com/apppasswords</a>.</li>
                    <li>{t("Въведете име (например „Бележки“) и натиснете „Създай“.", "Enter a name (for example “Receipts”) and press “Create”.")}</li>
                    <li>{t("Копирайте показаните 16 символа и ги поставете тук. Интервалите не са проблем.", "Copy the 16 characters shown and paste them here. Spaces are not a problem.")}</li>
                  </ol>
                  <p className="mt-1 text-muted">{t("Ако страницата не се отваря, 2-стъпковото потвърждаване още не е включено.", "If the page does not open, 2-Step Verification is not turned on yet.")}</p>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 md:col-span-2">
          <button className="btn" disabled={busy}>{busy ? "…" : t("Запази", "Save")}</button>
          <button type="button" className="btn btn-ghost" disabled={busy || !cfg?.has_password} onClick={test}>{t("Изпрати тестов имейл", "Send test email")}</button>
          {cfg && <button type="button" className="text-sm text-brand-dark" onClick={remove}>{t("Премахни", "Remove")}</button>}
        </div>
      </form>
      {msg ? (
        <p className={`mt-3 text-sm ${msg.ok ? "text-green-800" : "text-red-700"}`}>{msg.text}</p>
      ) : (
        cfg?.last_error && !cfg.verified_at && <p className="mt-3 text-sm text-red-700">{cfg.last_error}</p>
      )}
    </div>
  );
}
