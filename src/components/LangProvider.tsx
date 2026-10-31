"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, makeT, type Lang, type T } from "@/lib/i18n";

const Ctx = createContext<Lang>("bg");

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
export function useT(): T {
  const lang = useContext(Ctx);
  return useMemo(() => makeT(lang), [lang]);
}

/** Превключвател БГ / EN. Запомня избора за една година и презарежда страницата. */
export function LangToggle({ className = "" }: { className?: string }) {
  const lang = useLang();
  const router = useRouter();
  function pick(next: Lang) {
    if (next === lang) return;
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    // eslint-disable-next-line react-hooks/immutability
    document.documentElement.lang = next;
    router.refresh();
  }
  return (
    <div className={`inline-flex h-10 items-center rounded-full border-[1.5px] border-foreground/70 p-0.5 text-xs font-bold ${className}`} role="group" aria-label="Language">
      {(["bg", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1.5 uppercase transition ${lang === l ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground"}`}
        >
          {l === "bg" ? "БГ" : "EN"}
        </button>
      ))}
    </div>
  );
}
