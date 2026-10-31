"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Logo } from "@/components/SiteChrome";
import ThemeToggle from "@/components/ThemeToggle";
import { LangToggle, useLang, useT } from "@/components/LangProvider";

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "1";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [role, setRole] = useState<"shop" | "accountant">("shop");
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [forgot, setForgot] = useState(false);
  const isLogin = mode === "login";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setExisting(false);
    setForgot(false);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    const sb = supabaseBrowser();

    if (isLogin) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        if (error.code === "email_not_confirmed" || /confirm/i.test(error.message)) {
          return setMsg(t("Имейлът още не е потвърден. Отворете линка от писмото, което изпратихме при регистрацията.", "Your email is not confirmed yet. Open the link in the message we sent when you signed up."));
        }
        if (/rate limit|too many/i.test(error.message)) {
          return setMsg(t("Твърде много опити. Изчакайте няколко минути и опитайте отново.", "Too many attempts. Wait a few minutes and try again."));
        }
        setForgot(true);
        return setMsg(t("Грешен имейл или парола.", "Wrong email or password."));
      }
      router.push("/app");
      return;
    }

    if (password !== String(f.get("password2"))) {
      setBusy(false);
      return setMsg(t("Паролите не съвпадат. Проверете и опитайте отново.", "The passwords do not match. Check and try again."));
    }
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { role, lang }, emailRedirectTo: `${location.origin}/auth/callback?next=/app` },
    });
    setBusy(false);
    const exists =
      error?.message.toLowerCase().includes("already") ||
      // при включено потвърждение Supabase връща „празен“ профил за съществуващ имейл
      (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);
    if (exists) {
      setExisting(true);
      return setMsg(t("Този имейл вече е регистриран. Влезте в профила си или възстановете паролата.", "This email is already registered. Log in or reset your password."));
    }
    if (error) {
      return setMsg(
        /rate limit/i.test(error.message)
          ? t("Изпратени са твърде много писма. Опитайте отново след около час.", "Too many emails have been sent. Try again in about an hour.")
          : error.message
      );
    }
    if (data.session) router.push("/app");
    else setMsg(t("Изпратихме ви имейл за потвърждение. Отворете линка в него (работи и на телефон) и ще влезете автоматично.", "We sent you a confirmation email. Open the link in it (it works on a phone too) and you will be signed in automatically."));
  }

  // вход без парола: писмо с линк (за нов имейл се създава профил)
  async function magic(form: HTMLFormElement | null) {
    setMsg("");
    setExisting(false);
    setForgot(false);
    const email = String(new FormData(form ?? undefined).get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMsg(t("Въведете имейла си по-горе, после натиснете бутона.", "Enter your email above, then press the button."));
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, data: { role, lang }, emailRedirectTo: `${location.origin}/auth/callback?next=/app` },
    });
    setBusy(false);
    if (error) {
      return setMsg(
        /rate limit|too many|seconds/i.test(error.message)
          ? t("Изпратени са твърде много писма. Изчакайте малко и опитайте пак.", "Too many emails have been sent. Wait a little and try again.")
          : error.message
      );
    }
    setMsg(t(`Изпратихме линк за вход на ${email}. Отворете го (работи и на телефон) и ще влезете автоматично. Проверете и „Спам“.`, `We sent a sign-in link to ${email}. Open it (it works on a phone too) and you will be signed in automatically. Check Spam too.`));
  }

  async function google() {
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=/app`, queryParams: { prompt: "select_account" } },
    });
    if (error) setMsg(error.message);
  }

  const pwInput = (name: string, placeholder: string, auto: string) => (
    <div className="relative">
      <input
        name={name}
        type={showPw ? "text" : "password"}
        required
        minLength={8}
        placeholder={placeholder}
        className="input !pr-16"
        autoComplete={auto}
      />
      <button
        type="button"
        onClick={() => setShowPw((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-dark"
      >
        {showPw ? t("Скрий", "Hide") : t("Покажи", "Show")}
      </button>
    </div>
  );

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-ink-text lg:flex lg:flex-col lg:justify-between">
        <Link href="/" aria-label={t("КасаБГ, начало", "KasaBG, home")}><Logo light /></Link>
        <div className="max-w-sm">
          <div className="eyebrow !text-sun">{isLogin ? t("Добре дошли отново", "Welcome back") : t("Първата бележка е близо", "Your first receipt is close")}</div>
          <p className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight">
            {isLogin ? t("Месецът ви чака подреден.", "Your month is waiting, in order.") : t("Няколко минути и магазинът е свързан.", "A few minutes and your shop is connected.")}
          </p>
          <div className="mt-10 space-y-3 font-mono text-[12.5px]">
            {["0000000127 · #4821 · 66.57", "0000000126 · #4820 · 24.00", "0000000125 · #4819 · 112.80"].map((line, i) => (
              <div key={line} className="row-in flex items-center gap-3 rounded-lg border border-ink-line px-4 py-2.5" style={{ "--i": i } as React.CSSProperties}>
                <i className="inline-block h-2 w-2 rounded-full bg-sage" />{line}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-ink-faint">{t("Бележки и файл за НАП за онлайн магазини", "Receipts and the NRA file for online shops")}</div>
      </aside>

      <div className="page-in relative flex flex-col justify-center px-5 py-10 sm:px-12">
        <div className="absolute right-5 top-5 flex items-center gap-2"><LangToggle /><ThemeToggle /></div>
        <Link href="/" className="mb-8 lg:hidden"><Logo /></Link>
        <form onSubmit={submit} className="mx-auto w-full max-w-md space-y-3.5">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold">{isLogin ? t("Вход", "Log in") : t("Регистрация", "Sign up")}</h1>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["shop", t("Имам магазин", "I have a shop")],
                  ["accountant", t("Счетоводител съм", "I am an accountant")],
                ] as const
              ).map(([k, l]) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setRole(k)}
                  className={`rounded-xl border-[1.5px] px-3 py-2.5 text-sm font-semibold transition ${role === k ? "border-foreground bg-foreground text-background" : "border-line hover:border-foreground"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
          {!isLogin && role === "accountant" && (
            <p className="text-xs text-muted">
              {t("Регистрирайте се с имейла, който клиентът ви е добавил в раздел „Счетоводител“. Магазинът му ще се появи в таблото ви.", "Sign up with the email your client added in the “Accountant” section. Their shop will appear in your dashboard.")}
            </p>
          )}

          {googleEnabled && (
            <>
              <button type="button" onClick={google} className="btn btn-ghost w-full gap-3">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
                  <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
                </svg>
                {t("Продължи с Google", "Continue with Google")}
              </button>
              <div className="flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />{t("или с имейл", "or with email")}<span className="h-px flex-1 bg-line" /></div>
            </>
          )}

          <input name="email" type="email" required placeholder={t("Имейл", "Email")} className="input" autoComplete="email" />
          {pwInput("password", isLogin ? t("Парола", "Password") : t("Парола (мин. 8 символа)", "Password (min. 8 characters)"), isLogin ? "current-password" : "new-password")}
          {!isLogin && pwInput("password2", t("Повторете паролата", "Repeat the password"), "new-password")}

          <button className="btn w-full" disabled={busy}>
            {busy ? "…" : isLogin ? t("Вход", "Log in") : t("Създай профил", "Create account")}
          </button>
          {isLogin && (
            <p className="text-center text-sm">
              <Link href="/forgot" className="ulink text-brand-dark">{t("Забравена парола?", "Forgot your password?")}</Link>
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />{t("или без парола", "or without a password")}<span className="h-px flex-1 bg-line" /></div>
          <button type="button" className="btn btn-ghost w-full" disabled={busy} onClick={(e) => magic(e.currentTarget.form)}>
            {t("Вход с линк по имейл", "Sign in with an email link")}
          </button>

          {msg && <p className="rounded-lg bg-accent px-3 py-2 text-sm text-brand-dark">{msg}</p>}
          {(existing || forgot) && (
            <p className="text-center text-sm">
              {existing && <><Link href="/login" className="font-semibold text-brand-dark">{t("Към вход", "To log in")}</Link>{" · "}</>}
              <Link href="/forgot" className="font-semibold text-brand-dark">{t("Забравена парола", "Forgot password")}</Link>
            </p>
          )}
          <p className="pt-2 text-center text-sm text-muted">
            {isLogin ? (
              <>{t("Нямате профил?", "No account yet?")} <Link href="/register" className="ulink font-semibold text-brand-dark">{t("Регистрация", "Sign up")}</Link></>
            ) : (
              <>{t("Имате профил?", "Already have an account?")} <Link href="/login" className="ulink font-semibold text-brand-dark">{t("Вход", "Log in")}</Link></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
