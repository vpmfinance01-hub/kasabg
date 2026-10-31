"use client";
import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Logo } from "@/components/SiteChrome";
import ThemeToggle from "@/components/ThemeToggle";
import { LangToggle, useT } from "@/components/LangProvider";

export default function Forgot() {
  const t = useT();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset`,
    });
    setBusy(false);
    // не издаваме дали имейлът съществува
    setMsg(
      error
        ? error.message.toLowerCase().includes("rate limit")
          ? t("Изпратени са твърде много писма. Опитайте отново след около час.", "Too many emails have been sent. Try again in about an hour.")
          : error.message
        : t("Ако има профил с този имейл, ще получите писмо с линк за нова парола.", "If an account exists for this email, you will receive a message with a link to set a new password.")
    );
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <div className="absolute right-5 top-5 flex gap-2"><LangToggle /><ThemeToggle /></div>
      <Link href="/" className="mb-8 self-center"><Logo /></Link>
      <form onSubmit={submit} className="card space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">{t("Забравена парола", "Forgot password")}</h1>
        <p className="text-sm text-muted">{t("Въведете имейла си и ще ви изпратим линк за нова парола.", "Enter your email and we will send you a link to set a new password.")}</p>
        <input name="email" type="email" required placeholder={t("Имейл", "Email")} className="input" />
        <button className="btn w-full" disabled={busy}>{busy ? "…" : t("Изпрати линк", "Send link")}</button>
        {msg && <p className="rounded-lg bg-accent px-3 py-2 text-sm text-brand-dark">{msg}</p>}
        <p className="text-center text-sm"><Link href="/login" className="ulink text-brand-dark">{t("Назад към вход", "Back to log in")}</Link></p>
      </form>
    </div>
  );
}