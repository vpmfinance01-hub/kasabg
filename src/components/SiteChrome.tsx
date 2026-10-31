"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Arrow } from "./site/Icons";
import ThemeToggle from "./ThemeToggle";
import { LangToggle, useLang, useT } from "./LangProvider";

const links: [string, string, string][] = [
  ["/for-shops", "За магазини", "For shops"],
  ["/for-accountants", "За счетоводители", "For accountants"],
  ["/pricing", "Цени", "Pricing"],
  ["/integrations", "Интеграции", "Integrations"],
  ["/faq", "Въпроси", "FAQ"],
  ["/contact", "Контакти", "Contact"],
];

export function Logo({ light = false }: { light?: boolean }) {
  const en = useLang() === "en";
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden className={light ? "" : "text-foreground"}>
        <path d="M2 1h22v26l-3.7-2.6L16.6 27 13 24.4 9.4 27 5.7 24.4 2 27V1z" fill={light ? "#e8e8e8" : "currentColor"} />
        <path d="M7 8h12M7 13h12M7 18h7" stroke="#f2b705" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className={`font-[family-name:var(--font-display)] text-[1.5rem] font-bold leading-none ${light ? "text-ink-text" : "text-foreground"}`}>
        {en ? "Kasa" : "Каса"}<span className="ml-0.5 rounded-[2px] bg-brand px-1 text-[#161616]">{en ? "BG" : "БГ"}</span>
      </span>
    </span>
  );
}

export function Header() {
  const t = useT();
  const lang = useLang();
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 12);
      setProgress(h > 0 ? Math.min(1, y / h) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  const label = (bg: string, en: string) => (lang === "en" ? en : bg);

  return (
    <header className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? "border-b border-line bg-background/85 backdrop-blur-md" : "border-b border-transparent"}`}>
      <div className={`mx-auto flex max-w-6xl items-center justify-between px-5 transition-all duration-300 ${scrolled ? "py-2.5" : "py-5"}`}>
        <Link href="/" aria-label={t("КасаБГ, начало", "KasaBG, home")}><Logo /></Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([h, bg, en]) => (
            <Link key={h} href={h} aria-current={path === h ? "page" : undefined} className="ulink text-[0.93rem] font-medium">
              {label(bg, en)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LangToggle className="hidden sm:inline-flex" />
          <ThemeToggle className="hidden sm:flex" />
          <Link href="/login" className="ulink hidden text-[0.93rem] font-medium sm:block">{t("Вход", "Log in")}</Link>
          <Link href="/register" className="btn !py-2 text-[0.93rem]">{t("Започни", "Start")} <Arrow /></Link>
          <button className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label={t("Меню", "Menu")} aria-expanded={open}>
            <span className={`h-0.5 w-6 bg-foreground transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-6 bg-foreground transition ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-6 bg-foreground transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>
      <div className={`grid overflow-hidden bg-background transition-[grid-template-rows] duration-300 lg:hidden ${open ? "grid-rows-[1fr] border-b border-line" : "grid-rows-[0fr]"}`}>
        <div className="min-h-0 overflow-hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-5 pb-4">
            {links.map(([h, bg, en]) => (
              <Link key={h} href={h} className="border-t border-line py-3 text-lg font-medium">{label(bg, en)}</Link>
            ))}
            <Link href="/login" className="border-t border-line py-3 text-lg font-medium">{t("Вход", "Log in")}</Link>
            <div className="flex items-center gap-3 border-t border-line py-3"><LangToggle /><ThemeToggle /></div>
          </nav>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand" style={{ transform: `scaleX(${progress})` }} />
    </header>
  );
}

export function Footer() {
  const t = useT();
  return (
    <footer className="zig-top mt-28 bg-ink text-ink-soft">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed">
              {t(
                "Електронни бележки и месечен одиторски файл за онлайн магазини. Не замества вашия счетоводител.",
                "Electronic receipts and a monthly audit file for online shops. It does not replace your accountant."
              )}
            </p>
            <Link href="/register" className="btn mt-6 btn-on-ink">{t("Започни безплатно", "Start for free")} <Arrow /></Link>
          </div>
          <div className="space-y-2 text-[0.95rem]">
            <div className="eyebrow !text-sun">{t("Продукт", "Product")}</div>
            <Link href="/for-shops" className="ulink block w-fit">{t("За магазини", "For shops")}</Link>
            <Link href="/for-accountants" className="ulink block w-fit">{t("За счетоводители", "For accountants")}</Link>
            <Link href="/integrations" className="ulink block w-fit">{t("Интеграции", "Integrations")}</Link>
            <Link href="/pricing" className="ulink block w-fit">{t("Цени", "Pricing")}</Link>
          </div>
          <div className="space-y-2 text-[0.95rem]">
            <div className="eyebrow !text-sun">{t("Информация", "Information")}</div>
            <Link href="/help" className="ulink block w-fit">{t("Ръководство", "User guide")}</Link>
            <Link href="/security" className="ulink block w-fit">{t("Сигурност", "Security")}</Link>
            <Link href="/terms" className="ulink block w-fit">{t("Общи условия", "Terms")}</Link>
            <Link href="/privacy" className="ulink block w-fit">{t("Поверителност", "Privacy")}</Link>
            <a href="https://nra.bg" target="_blank" rel="noreferrer" className="ulink block w-fit">{t("НАП", "Bulgarian NRA")}</a>
          </div>
        </div>
        <div className="mt-12 border-t border-ink-line pt-6 text-xs text-ink-faint">© {new Date().getFullYear()} {t("КасаБГ", "KasaBG")}</div>
      </div>
    </footer>
  );
}
