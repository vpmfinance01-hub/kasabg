"use client";
import { useEffect, useState } from "react";
import { useT } from "./LangProvider";

type Theme = "light" | "dark" | "nexus";
const ORDER: Theme[] = ["light", "dark", "nexus"];

const read = (): Theme => {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark" || set === "nexus") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/** Превключвател на темата: светла, тъмна, „Лайм“. Изборът се пази в браузъра; без избор следва настройката на устройството. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useT();
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(read());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => {
      if (!document.documentElement.dataset.theme) setTheme(read());
    };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  function toggle() {
    const next = ORDER[(ORDER.indexOf(read()) + 1) % ORDER.length];
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  }

  const names: Record<Theme, [string, string]> = {
    light: [t("Светла тема", "Light theme"), t("Светла", "Light")],
    dark: [t("Тъмна тема", "Dark theme"), t("Тъмна", "Dark")],
    nexus: [t("Тема „Лайм“", "Lime theme"), t("Лайм", "Lime")],
  };
  const cur = theme ?? "light";
  const next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
  return (
    <button
      type="button"
      onClick={toggle}
      className={`group relative flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-foreground/70 transition hover:bg-accent ${className}`}
      aria-label={t("Смени темата към: ", "Switch theme to: ") + names[next][0]}
      title={`${names[cur][1]} → ${names[next][1]}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="transition-transform duration-500 group-hover:rotate-[24deg]">
        {cur === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : cur === "nexus" ? (
          <>
            <rect x="3" y="3" width="18" height="18" rx="6" />
            <circle cx="12" cy="12" r="3.5" fill="#c5f25c" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        )}
      </svg>
    </button>
  );
}
