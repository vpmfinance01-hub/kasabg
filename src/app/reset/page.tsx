"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Logo } from "@/components/SiteChrome";
import ThemeToggle from "@/components/ThemeToggle";
import { LangToggle, useT } from "@/components/LangProvider";

export default function Reset() {
  const t = useT();
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabaseBrowser().auth.getSession().then(({ data }) => setHasSession(!!data.session));
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const p1 = String(f.get("p1"));
    if (p1 !== String(f.get("p2"))) return setMsg(t("Паролите не съвпадат.", "The passwords do not match."));
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password: p1 });
    setBusy(false);
    if (error) return setMsg(error.message);
    router.push("/app");
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <div className="absolute right-5 top-5 flex gap-2"><LangToggle /><ThemeToggle /></div>
      <Link href="/" className="mb-8 self-center"><Logo /></Link>
      {hasSession === false ? (
        <div className="card space-y-3 text-center">
          <p>{t("Линкът е изтекъл или вече е използван.", "The link has expired or was already used.")}</p>
          <Link href="/forgot" className="btn inline-block">{t("Поискай нов линк", "Request a new link")}</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="card space-y-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">{t("Нова парола", "New password")}</h1>
          <input name="p1" type="password" required minLength={8} placeholder={t("Нова парола (мин. 8 символа)", "New password (min. 8 characters)")} className="input" autoComplete="new-password" />
          <input name="p2" type="password" required minLength={8} placeholder={t("Повторете паролата", "Repeat the password")} className="input" autoComplete="new-password" />
          <button className="btn w-full" disabled={busy || hasSession === null}>{busy ? "…" : t("Запази паролата", "Save password")}</button>
          {msg && <p className="rounded-lg bg-accent px-3 py-2 text-sm text-brand-dark">{msg}</p>}
        </form>
      )}
    </div>
  );
}